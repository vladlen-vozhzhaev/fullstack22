const express = require('express');
const mysql = require("mysql2");
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const port = 3000;
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "fullstack22",
    password: ""
});
app.use(cookieParser('secret'))
app.use(express.static(__dirname + "/public"));
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get("/", (req, res)=>{
    res.status(200).type('text/plain');
    res.send('Home page');
})
app.post("/reg", urlencodedParser, (req, res)=>{
    console.log("req.body", req.body);
    console.log("req.params", req.params);
    let name = req.body.name;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let pass = req.body.pass;
    connection.execute("INSERT INTO `users`(`name`, `lastname`, `email`, `pass`) VALUES (?,?,?,?)",
                    [name, lastname, email, pass],
                    (err, resultSet)=>{
                        res.status(200).type('text/plain');
                        res.send('success');
                    })
    });
app.post('/login', urlencodedParser, (req, res)=>{
    console.log("req.body", req.body);
    let email = req.body.email;
    let pass = req.body.pass;
    connection.execute("SELECT * FROM `users` WHERE `email`=? AND `pass`=?", [email, pass], (err, resultSet)=>{
        console.log(resultSet);
        let result = {"result": "error"};
        if(resultSet.length){
            res.cookie('token', '12345ABCDE');
            res.cookie('id', resultSet[0].id);
            result = {"result": "success"}
        }
        res.status(200).type('application/json');
        res.json(result);
    });
})
app.get('/getUserData', (req, res)=>{
   const token = req.cookies.token;
   const userId = req.cookies.id;
   if(token === '12345ABCDE'){
       connection.execute("SELECT * FROM users WHERE id=?", [userId], (err, resultSet)=>{
           res.json(resultSet[0]);
       })
   }

});

app.listen(port,  ()=>console.log(`Server listens http://localhost:${port}`));
// 127.0.0.1 localhost

