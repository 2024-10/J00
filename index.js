const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const usersRouter = require('./routes/users');
const client = require('./db'); // MySQL 클라이언트 사용

const app = express();

// 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 정적 파일 미들웨어
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.use('/api/users', usersRouter);

// 뷰 라우트 설정
app.get('/signup.html', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

app.get('/signin.html', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

app.get('/', (req, res) => {
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;
    res.render('home', { title: 'Home', user });
});

app.get('/profile.html', (req, res) => {
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;

    if (user) {
        client.query('SELECT * FROM user WHERE user_id = ?', [user.user_id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
            const userProfile = results[0];
            if (userProfile) {
                const birthday = new Date(userProfile.user_birthday);
                userProfile.user_birthday = `${birthday.getFullYear()}-${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;
            }
            res.render('profile', { title: 'Profile', user: userProfile });
        });
    } else {
        res.redirect('/signin.html');
    }
});

// 서버 시작
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
