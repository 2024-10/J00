const http = require("http");
const express = require('express'); //express모듈을 가져와서 변수에 저장함
var app = express(); //express앱을 생성하여 app변수에 저장함
const port = 8000; //port번호 설정

app.use(express.json());

const server = http.createServer(app);

try {
  server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
} catch (err) {
  console.log(err);
}

//DB작업
const mysql = require("mysql");
const cors = require("cors");
var client = mysql.createConnection({
  user: 'root',
  host: "localhost",
  port: 3306,
  password: "maengssu0410",
  database: "c_list"
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //body parser설정, qs모듈 사용
app.use(express.static("public")); 
app.set("view engine", "ejs"); //뷰엔진을 ejs로

let check = [""];

app.get("/", (req,res) => {
  client.query("SELECT * FROM checklist", 
    (err, result) => {
      if(err) {
        console.log(err);
        res.status(500).send("err");
      } else {
        //console.log(result);
        res.render("index", { check: result });
      }
    }
  );
});

app.post("/addTask", (req, res) => {
  //DB연결해서 해볼게유
    const content = req.body.add;
    client.query(
      "INSERT INTO checklist (content) VALUES (?)",
      [content],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      }
    );
    //check.push(req.body.add); //input에 입력한 값, add == input태그의 name에 해당하는 값
    //res.redirect("/");
});



app.post("/deleteCheck", (req, res) => {
    const checkid = req.body.del;
    client.query("delete from checklist where checkid = ?;",
    [checkid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    }
  );

    //const del = req.body.del;
    //check.splice(del, 1);
    //res.redirect("/");
});