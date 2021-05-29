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

var session_mail=null
app.get('/', (req, res) => {
    res.render('index')   
})

app.get('/error', (req, res) => {
    res.send("<h3>There was an issue while loading page. Either you are not registered user or having incorrent credentials</h3>")
})

app.get('/login', (req, res) => {
        res.render('login')
})

app.get('/registerUser', (req, res) => {
    res.render('signup')
})
app.get('/updateWeatherData', (req, res) => {
    var sql = `SELECT city FROM weather_data`
    connection.query(sql, function (err, result){
        if (err) throw err;
        for (obj of result){
            let city=obj['city']
            let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
            async function getWeather(){
                let response = await fetch(url); 
                let json = await response.json();

                let desc=json.weather[0].description
                let temperature = json.main.temp
                let min_temp = json.main.temp_min
                let max_temp = json.main.temp_max
                let wind_speed = json.wind.speed
                let clouds = json.clouds.all
                let sql = `UPDATE weather_data SET temperature=? , description=?, min_temperature=?, max_temperature=?, wind=?, cloud_percent=? WHERE city=?;` 
                let values = [temperature, desc, min_temp, max_temp, wind_speed, clouds, city]
                connection.query(sql,values, function (err, result) {
                    if (err) throw err;
                  });
        
            }
            getWeather();
        
        }
      });
    res.redirect('/')
    
})

app.get('/profile', (req, res) => {
        if(session_mail!=null){
        res.send("Logged in")
        }
        else{
            res.redirect('/login')
        }
})

app.post('/login_handle', (req, res) => {
    let email = req.body.email
    let pass = req.body.pass
    let sql = `SELECT * FROM users WHERE email=? AND password=?`;
    let values =  [email, pass]
    connection.query(sql,values, function (err, result) {
        if (err) throw err;
        if(result.length==0){
            res.redirect('/error')
        }
        else{
            session_mail=email
            res.redirect('/profile')
        }
      });
})

app.post('/signup_handle', (req, res) => {
    request_obj=req.body;
    var cities=[]
    for(let param in request_obj){
        if(request_obj[param]=='on'){
            cities.push(param)
        }
    }
    var name=req.body.name;
    var email=req.body.email;
    var pass=req.body.pass;
    let city1 = cities[0]
    let city2 = cities[1]
    let city3 = cities[2]
    let sql =  `INSERT INTO weather_data(city, user_email) VALUES?`
    let rows = [
        [city1, email],
        [city2, email],
        [city3, email]
    ]
    connection.query(sql,[rows], function(err, result) {
        if (err) throw err;
        console.log("Inserted cities")
      });
    sql = `INSERT INTO users (username, email,password) VALUES ?`;
    let values = [  
        [name, email, pass]
        ];
    connection.query(sql,[values], function (err, result) {
        if (err) throw err;
        console.log("Inserted user")
      });   
      res.redirect('/login')
    //res.redirect("/updateWeatherData")
})

app.listen(3000, ()=>{
    console.log("Port open")
})