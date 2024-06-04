const mysql = require("mysql");

const client = mysql.createConnection({
  user: 'root',
  host: "35.222.31.17",
  port: 3306,
  password: "mysqlj00*",
  database: "j00"
});

client.connect(err => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
  } else {
    console.log('데이터베이스에 연결되었습니다.');
  }
});

module.exports = client;