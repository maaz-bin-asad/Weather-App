const express = require('express')
const path = require('path')
const fetch = require("node-fetch");  // for calling API
var bodyParser = require('body-parser');
var connection = require('./db'); // importing database credentials module

const app = express()   // create express app

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine','ejs')  // set view engine as EJS

var API_KEY='4d707ab71bbd1aa79de4b50555312842'

var session_mail = null   // variable to act like session storage when user is logged in, else if user is not logged in, it will remain null

// Routes start here

app.get('/', (req, res) => {
    res.render('index')   
})

app.get('/error', (req, res) => {
    res.send("<h3>There was an issue while loading page. Either you are not registered user or having incorrent credentials</h3> <h1><a href='/'>Go to home page</a></h1>")
})

app.get('/login', (req, res) => {
        if(session_mail == null){
        res.render('login')
        }
        else{
            res.redirect('/profile')
        }
})

app.get('/logout', (req, res) => {
    session_mail=null;       // when user is not logged in, keep session mail as null
    res.redirect('/login')
})

app.get('/registerUser', (req, res) => {
    res.render('signup')
})

app.get('/updateWeatherData', (req, res) => {  // route to update the data
    var sql = `SELECT city FROM weather_data`
    connection.query(sql, function (err, result){
        if (err) throw err;
        for (obj of result){    // the loop iterates over the cities and updates the DB where that city is present
            let city=obj['city']
            let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`  //call the API
            async function getWeather(){
                let response = await fetch(url); 
                let json = await response.json();

                let desc = json.weather[0].description
                let temperature = json.main.temp
                let min_temp = json.main.temp_min
                let max_temp = json.main.temp_max
                let wind_speed = json.wind.speed
                let clouds = json.clouds.all

                let sql = `UPDATE weather_data SET temperature=? , description=?, min_temperature=?, max_temperature=?, wind=?, cloud_percent=? WHERE city=?;` 
                let values = [temperature, desc, min_temp, max_temp, wind_speed, clouds, city]
                connection.query(sql, values, function (err, result) {
                    if (err) throw err;
                  });
        
            }
            getWeather();
        }
      });
    res.redirect('/')
    
})

app.get('/profile', (req, res) => {
        if(session_mail != null){  // if user has logged in
        res.render("profile")
        }
        else{                                    
            res.redirect('/login')
        }
})

app.get('/userWeatherData', (req, res) => {
    let sql = `SELECT * FROM weather_data WHERE user_email=?`;  // select the rows where foreign key is current user's mail
    let values = [session_mail]
    connection.query(sql, values, function (err, result) {
        if (err) throw err;
      res.render("data", {'weather_detail' : result})   // send all the rows as array of objects for rendering
      });
      
      
})
app.post('/setUserPreferences', (req, res)  => {   //route to set user preferences
    request_obj=req.body;
    var cities=[]
    for(let param in request_obj){
        if(request_obj[param]=='on'){
            cities.push(param)
        }
    }
    let sql = `DELETE FROM weather_data WHERE user_email=?` //delete previous rows having this mail
    let email = [session_mail]
    connection.query(sql, email, function(err, result) {
        if (err) throw err;
        console.log("Deleted")
      });
      let city1 = cities[0]
      let city2 = cities[1]
      let city3 = cities[2]
      sql =  `INSERT INTO weather_data(city, user_email) VALUES?`   //insert updated rows
      let rows = [
          [city1, email],
          [city2, email],
          [city3, email]
      ]
      connection.query(sql,[rows], function(err, result) {
          if (err) throw err;
          console.log("Inserted new cities")
        });
    res.send("<h3>Your preferences have been updated successfully.</h3> <h1><a href='/updateWeatherData'>Home</a></h1>")


})
app.post('/login_handle', (req, res) => {   // route to handle the login credentials
    let email = req.body.email
    let pass = req.body.pass
    let sql = `SELECT * FROM users WHERE email=? AND password=?`;
    let values = [email, pass]
    connection.query(sql, values, function(err, result) {
        if (err) throw err;
        if(result.length==0){
            res.redirect('/error')  // if no record found with credentials, redirect to error route
        }
        else{
            session_mail = email    // else assign current mail to global variable that acts as a session variable 
            res.redirect('/profile')
        }
      });
})

app.post('/signup_handle', (req, res) => {   // route to handle signup data 
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
    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Inserted user")
      });
    
    res.redirect("/updateWeatherData")
})

//Routes end here

app.listen(3000, ()=>{  //open port 3000 to listen
    console.log("Running")
})