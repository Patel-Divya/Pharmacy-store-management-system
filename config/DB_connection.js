const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '<host-name>',
    user: '<user-name>',
    password: '<your-password>',
    database: '<your database-name>'
});

connection.connect(function(error){
    if(error){ 
        throw error; 
        console.log("Cannot connect Database");
    }
    else console.log("Database connection successful.")
});

module.exports = connection;
