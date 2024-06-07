const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const usersRouter = require('./routes/users');
const shareRouter = require('./routes/share');
const addFriendRouter = require('./routes/add_friend');
const mandalartRouter = require('./routes/mandalart'); // Import mandalart routes
const client = require('./db'); // MySQL 클라이언트 사용
const schedule = require('node-schedule');
const commentRouter = require('./routes/comment');
const calendarRouter = require('./routes/calendar'); // 추가

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
app.use('/api/share', shareRouter);
app.use('/api/add_friend', addFriendRouter);
app.use('/mandalart', mandalartRouter); // Use mandalart routes
app.use('/comment', commentRouter);

app.use('/calendar', calendarRouter);


// 뷰 라우트 설정
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});
app.get('/signin', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});
app.get('/share', (req, res) => {
    const userCookie = req.cookies['USER'];
    if (!userCookie) {
        return res.redirect('/signin');
    }
    res.render('share', { title: 'Share' });
});

app.get('/add_friend', (req, res) => {
    const userCookie = req.cookies['USER'];
    if (!userCookie) {
        return res.redirect('/signin');
    }
    res.render('add_friend', { title: 'Add Friend' });
});
app.get('/', (req, res) => {
    const userCookie = req.cookies['USER'];
    const user = userCookie ? JSON.parse(userCookie) : null;
    res.render('home', { title: 'Home', user });
});
app.get('/profile', (req, res) => {
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
        res.redirect('/signin');
    }
});
app.get('/share_viewMandalart', (req, res) => {
    const userCookie = req.cookies['USER'];
    if (!userCookie) {
        return res.redirect('/signin');
    }
    res.render('share_viewMandalart', { title: 'Share' });
});

schedule.scheduleJob('0 0 * * *', async () => {
    try {
        // 어제 날짜를 'YYYY-MM-DD' 형식으로 가져옴
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // 오늘 날짜를 'YYYY-MM-DD' 형식으로 가져옴
        const todayStr = new Date().toISOString().split('T')[0];

        // 어제 날짜의 체크리스트 가져오기
        client.query("SELECT * FROM checklist WHERE DATE(date) = ?", [yesterdayStr], (err, result) => {
            if (err) {
                console.log('Error fetching checklist:', err);
            } else {
                const newChecklistEntries = result.map(entry => [
                    entry.mandalart_id,
                    entry.tedolist_number,
                    entry.checklist_detail,
                    "", // imogi 초기화
                    todayStr, // 오늘 날짜
                    false // is_checked 초기화
                ]);

                // 새로운 체크리스트 삽입
                if (newChecklistEntries.length > 0) {
                    client.query("INSERT INTO checklist (mandalart_id, tedolist_number, checklist_detail, imogi, date, is_checked) VALUES ?", [newChecklistEntries], (insertErr, insertResult) => {
                        if (insertErr) {
                            console.log('Error inserting new checklist entries:', insertErr);
                        } else {
                            console.log('Successfully inserted new checklist entries for today:', insertResult);
                        }
                    });
                } else {
                    console.log('No checklist entries found for yesterday.');
                }
            }
        });
    } catch (error) {
        console.log('Error during scheduled task:', error);
    }
});



// 서버 시작
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Server running on  http://localhost:${PORT}`));