const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pharmacy_management'
});

connection.connect(function(error){
    if(error){ 
        throw error; 
        console.log("Cannot connect Database");
    }
    else console.log("Database connection successful.")
});

module.exports = connection;