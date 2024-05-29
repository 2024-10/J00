const http = require("http");
const express = require('express');
const client = require('./db'); //db.js불러와
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const usersRouter = require('./routes/users');
const app = express();


// Body parser middleware
app.use(bodyParser.json());
// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// 뷰 엔진 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// Routes
app.use('/api/users', require('./routes/users'));
const mandalartRoutes = require('./routes/mandalart');
app.use('/mandalart', mandalartRoutes);

// Start the server
const PORT = process.env.PORT || 8000;
//const server = http.createServer(app);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.redirect('/mandalart');
});