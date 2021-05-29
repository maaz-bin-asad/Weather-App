const express = require('express')
const path = require('path')
const fetch = require("node-fetch");
var bodyParser = require('body-parser');
var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'weather'
  })
  
connection.connect()  
const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine','ejs')
var city = 'Delhi'
API_KEY='4d707ab71bbd1aa79de4b50555312842'
var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
app.get('/', (req, res) => {
    async function getWeather(){
        const response = await fetch(url); 
        let json = await response.json();
        var desc=json.weather[0].description
        var temperature=json.main.temp

    }
    getWeather();
    res.render('index')   
})


app.get('/login', (req, res) => {
        res.render('login')
})

app.get('/registerUser', (req, res) => {
    res.render('signup')
})

app.get('/updateWeatherData', (req, res) =>{
    res.send("Data updated")
})

app.post('/login_handle', (req, res) => {
    console.log(req.body)
    res.redirect("/")
})

app.post('/signup_handle', (req, res) => {
    var name=req.body.name;
    var email=req.body.email;
    var pass=req.body.pass;
    var sql = `INSERT INTO users (name, email,password,city1,city2,city3) VALUES ?`;
    var values = [  
        [name, email, pass, 'Delhi', 'Shimla', 'Bengaluru']
        ];        
    connection.query(sql,[values], function (err, result) {
        if (err) throw err;
      });   
    res.redirect("/")
})

app.listen(3000, ()=>{
    console.log("Port open")
})