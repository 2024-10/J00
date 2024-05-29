const http = require("http");
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8000;

// MySQL 클라이언트 불러오기
const client = require('./db');

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// 뷰 엔진 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// 라우터 설정
const mandalartRoutes = require('./routes/mandalart');
app.use('/mandalart', mandalartRoutes);

app.get("/", (req, res) => {
  res.redirect('/mandalart');
});

// 서버 설정 및 시작
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
