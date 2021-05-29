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
var API_KEY='4d707ab71bbd1aa79de4b50555312842'

app.get('/', (req, res) => {
    
    res.render('index')   
})


app.get('/login', (req, res) => {
        res.render('login')
})

app.get('/registerUser', (req, res) => {
    res.render('signup')
})

app.get('/updateWeatherData', (req, res) =>{
    var sql = `SELECT city FROM weather_data`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        for (obj of result){
            var city=obj['city']
            var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
            async function getWeather(){
                const response = await fetch(url); 
                let json = await response.json();
                let desc=json.weather[0].description
                let temperature=json.main.temp
                console.log(desc)
                console.log(temperature)
                let sql = `UPDATE weather_data SET temperature=? , description=? WHERE city=?;` 
                let values = [temperature, desc, city]
                connection.query(sql,values, function (err, result) {
                    if (err) throw err;
                  });
        
            }
            getWeather();
        
        }
      });
    res.redirect('/')
    
})

app.post('/login_handle', (req, res) => {
    console.log(req.body)
    res.redirect("/")
})

app.post('/signup_handle', (req, res) => {
    var name=req.body.name;
    var email=req.body.email;
    var pass=req.body.pass;
    var sql = `INSERT INTO users (username, email,password) VALUES ?`;
    var values = [  
        [name, email, pass]
        ];
    connection.query(sql,[values], function (err, result) {
        if (err) throw err;
        console.log("Inserted")
      });   
    res.redirect("/")
})

app.listen(3000, ()=>{
    console.log("Port open")
})