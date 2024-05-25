// 회원가입 및 로그인 로직

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const User = require('./models/Users'); // 수정된 부분

const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const USER_COOKIE_KEY = 'USER';

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs').promises;
const USERS_JSON_FILENAME = 'user.json';

async function fetchAllUsers() {
    const data = await fs.readFile(USERS_JSON_FILENAME);
    const users = JSON.parse(data.toString());
    return users;
}

async function fetchUser(username) {
    const users = await fetchAllUsers();
    const user = users.find((user) => user.name === username); // 수정된 부분
    return user;
}

async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const users = await fetchAllUsers();
    users.push({
        ...newUser,
        password: hashedPassword,
    });
    await fs.writeFile(USERS_JSON_FILENAME, JSON.stringify(users));
}

router.post('/join', async (req, res) => {
    const { name, email, password, birth, nickname } = req.body;

    try {
        let user = await fetchUser(name);
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = { name, email, password, birth, nickname }; // 수정된 부분

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await createUser(user);

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.cookie(USER_COOKIE_KEY, JSON.stringify(user));
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Authenticate user and get token
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        let user = await fetchUser(name);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        res.cookie(USER_COOKIE_KEY, JSON.stringify(user));

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
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
        const user = await fetchUser(userData.name);
        if (user) {
            res.status(200).send(`
                <a href="/logout">Log Out</a>
                <h1>id: ${userData.name}, email: ${userData.email}, birth: ${userData.birth}, nickname: ${userData.nickname}</h1>
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

app.listen(3000, () => {
    console.log('server is running at 3000');
});

module.exports = router;
