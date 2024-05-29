const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const sequelize = require('../db')

const USER_COOKIE_KEY = 'USER';
//const USERS_JSON_FILENAME = 'user.json';

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Error syncing database:', err));

async function fetchAllUsers() {
    try {
        const data = await fs.readFile(USERS_JSON_FILENAME, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // 파일이 없으면 빈 배열 반환
            return [];
        } else {
            throw err;
        }
    }
}

async function fetchUser(username) {
    const users = await fetchAllUsers();
    return users.find(user => user.name === username);
}

async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const users = await fetchAllUsers();
    const userWithHashedPassword = {
        ...newUser,
        password: hashedPassword,
    };
    users.push(userWithHashedPassword);
    await fs.writeFile(USERS_JSON_FILENAME, JSON.stringify(users, null, 2));
    console.log('New user saved:', userWithHashedPassword); // 디버깅 로그 추가
}

router.post('/join', async (req, res) => {
    const { name, email, password, birth, nickname } = req.body;

    try {
        let user = await fetchUser(name);
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = { name, email, password, birth, nickname };
        await createUser(newUser);

        const payload = { user: { name: newUser.name } };
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
    const { name, password } = req.body;

    try {
        let user = await fetchUser(name);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        console.log('User found:', user);
        console.log('Comparing password:', password, 'with hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch); // 디버깅 로그 추가
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { name: user.name } };
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

router.get('/', async (req, res) => {
    const userCookie = req.cookies[USER_COOKIE_KEY];

    if (userCookie) {
        const userData = JSON.parse(userCookie);
        const user = await fetchUser(userData.name);
        if (user) {
            res.status(200).send(`
                <a href="/logout">Log Out</a>
                <h1>id: ${user.name}, email: ${user.email}, birth: ${user.birth}, nickname: ${user.nickname}</h1>
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

app.listen(5004, () => {
    console.log('Server running on port 5004');
});

module.exports = router;
