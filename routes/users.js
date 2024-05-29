const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
const client = require('../db'); // MySQL 클라이언트 사용

const USER_COOKIE_KEY = 'USER';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

async function fetchUser(user_id) {
    return new Promise((resolve, reject) => {
        client.query('SELECT * FROM user WHERE user_id = ?', [user_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]);
        });
    });
}

async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.user_pw, 10);
    newUser.user_pw = hashedPassword;
    return new Promise((resolve, reject) => {
        client.query('INSERT INTO user SET ?', newUser, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

router.post('/join', async (req, res) => {
    const { user_id, user_email, user_pw, user_birthday, user_nickname } = req.body;

    try {
        let user = await fetchUser(user_id);
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = { user_id, user_email, user_pw, user_birthday, user_nickname };
        await createUser(newUser);

        const payload = { user: { user_id: newUser.user_id } };
        jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.cookie(USER_COOKIE_KEY, JSON.stringify(payload.user));
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { user_id, user_pw } = req.body;

    try {
        let user = await fetchUser(user_id);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        console.log('User found:', user);
        console.log('Comparing password:', user_pw, 'with hash:', user.user_pw);

        const isMatch = await bcrypt.compare(user_pw, user.user_pw);
        console.log('Password match result:', isMatch); // 디버깅 로그 추가
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { user_id: user.user_id } };
        jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.cookie(USER_COOKIE_KEY, JSON.stringify(payload.user));
            res.redirect('/'); // 로그인 성공 시 홈 페이지로 리디렉션
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/', async (req, res) => {
    const userCookie = req.cookies[USER_COOKIE_KEY];

    if (userCookie) {
        const userData = JSON.parse(userCookie);
        const user = await fetchUser(userData.user_id);
        if (user) {
            res.status(200).send(`
                <a href="/logout">Log Out</a>
                <h1>id: ${user.user_id}, email: ${user.user_email}, birth: ${user.user_birthday}, nickname: ${user.user_nickname}</h1>
            `);
            return;
        }
    }

    res.status(200).send(`
        <a href="/login.html">Log In</a>
        <a href="/signup.html">Sign Up</a>
        <h1>Not Logged In</h1>
    `);
});

module.exports = router;
