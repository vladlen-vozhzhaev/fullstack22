const express = require('express');
const mysql = require("mysql2");
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();
const saltRounds = 10;
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
app.post("/reg", upload.any(), (req, res)=>{
    console.log("req.body", req.body);
    console.log("req.params", req.params);
    let name = req.body.name;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let pass = req.body.pass;
    connection.execute("SELECT id FROM users WHERE email=?", [email], (err, resultSet)=>{
        if(resultSet.length) res.json({result: "user_exist"});
        else
            bcrypt.hash(pass, saltRounds, function(err, hash) {
                connection.execute("INSERT INTO `users`(`name`, `lastname`, `email`, `pass`) VALUES (?,?,?,?)",
                    [name, lastname, email, hash],
                    (err, resultSet)=>{
                        res.status(200).type('text/plain');
                        res.json({result: "success"});
                    })
            });
    });
});

app.post('/login', upload.any(), (req, res)=>{
    console.log("req.body", req.body);
    let email = req.body.email;
    let pass = req.body.pass;
    connection.execute("SELECT * FROM `users` WHERE `email`=?", [email], (err, resultSet)=>{
        console.log(resultSet);
        if(resultSet.length){
            bcrypt.compare(pass, resultSet[0].pass, function(err, result) {
                if(result === true){
                    let token = uuidv4();
                    connection.execute("UPDATE users SET token=? WHERE email=?", [token, email], (err)=>{
                        res.cookie('token', token);
                        res.status(200).type('application/json');
                        res.json({"result": "success"});
                    })
                }else{
                    res.json({"result": "error"});
                }
            });
        }else{
            res.json({"result": "error"});
        }
    });
})

app.get('/getUserData', (req, res)=>{
   const token = req.cookies.token;
   console.log(token);
   connection.execute("SELECT * FROM users WHERE token=?", [token], (err, resultSet)=>{
       if(resultSet.length) res.json(resultSet[0]);
       else res.json({result: "error"})
   })
});

app.get('/logout', (req, res)=>{
    res.clearCookie('token');
    res.status(200).type('application/json');
    res.json({"result": "success"});
});
app.listen(port,  ()=>console.log(`Server listens http://localhost:${port}`));
// 127.0.0.1 localhost
