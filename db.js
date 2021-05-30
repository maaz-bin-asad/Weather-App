var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'weather_detail'
  })

connection.connect()  
module.exports = connection;
