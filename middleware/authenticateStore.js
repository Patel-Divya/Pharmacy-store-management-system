const connection = require('../config/DB_connection'); // DataBase connection

const authenticateStore = (req, res, next) => {
    const sessionToken = req.cookies.sessionToken;

    //console.log('authentication working');
    
    if (sessionToken) {
        connection.query('SELECT * FROM sessions WHERE session_id = ?', [sessionToken], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                return;
            }
   
            if (results.length > 0) {
                const store = results[0].store_id;
                req.store = store;
                next(); // Proceed to the next middleware or route handler
            } else { 
                //console.log("Unauthorised access");
                res.clearCookie('sessionToken');
                res.redirect('/');
            }
        });
    } else {
      //console.log("Unauthorised access");
      res.redirect('/');
    }
};

module.exports = authenticateStore;