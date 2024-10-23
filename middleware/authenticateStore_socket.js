const connection = require('../config/DB_connection'); // DataBase connection

module.exports = (socket, next) =>{
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = parseCookies(cookieHeader);
  
    const sessionToken = cookies.sessionToken;
  
    if (sessionToken) {
      // Query the database to find the corresponding store_id based on the session token
      connection.query('SELECT * FROM sessions WHERE session_id = ?', [sessionToken], (error, results) => {
        if (error) {
          console.error('Error querying database:', error);
          return next(new Error('Database error'));
        }
  
        if (results.length > 0) {
          const storeId = results[0].store_id;
          socket.storeId = storeId;
          next();
        } else {
          next(new Error('Unauthorized access'));
        }
      });
    } else {
      next(new Error('Unauthorized access'));
    }

    function parseCookies(cookieHeader) {
        const cookies = {};
            
        if (cookieHeader) {
          const cookiePairs = cookieHeader.split(';');
              
            for (const cookiePair of cookiePairs) {
                const [name, value] = cookiePair.trim().split('=');
                cookies[name] = value;
             }
        }
        return cookies; // coockies will be in json form
    }
}