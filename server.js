const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const port = 5000;

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const connection = require('./config/DB_connection'); // DataBase connection
const routes = require('./routes/routes');

app.use(express.static(path.join(__dirname, 'public'))); // htmp files under public can access the external JS and CSS
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//router setup
app.use('/', routes);
app.use('/login', routes);
app.use('/signup', routes);
app.use('/bill', routes);
app.use('/dashboard', routes);
app.use('/logout', routes);


// socket setup for each page
const bills_soket = require('./sockets/bills_socket');
bills_soket(io.of('/bills'));

const dashboard_socket = require('./sockets/dashboard_socket');
dashboard_socket(io.of('/dashboard'));

const manage_stock_socket = require('./sockets/manage_stock_socket');
manage_stock_socket(io.of('/manage-stocks'));

const account_socket = require('./sockets/account_socket');
account_socket(io.of('/account'));

// Signup route
app.post('/signup', (req, res) => {
  const { email, password, phone, state, city, address, pincode } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).send('Error hashing password');
      return;
    }
    connection.query('INSERT INTO stores (email, password, phone, state, city, address, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, hash, phone, state, city, address, pincode], (error, results) => {
      if (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Error signing up');
        return;
      }
      console.log('User signed up successfully');
      res.redirect('/login');
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query('SELECT * FROM stores WHERE email = ?', [email], (error, results) => {
    
    if (error) {
      console.error('Error querying database:', error);
      res.status(500).send('Error querying database');
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          res.status(500).send('Error comparing passwords');
          return;
        }
        
        if (result) {
          const sessionToken = Math.random().toString(36).substring(2);
          connection.query('INSERT INTO sessions (session_id, store_id) VALUES (?, ?)', [sessionToken, user.sid], (insertError, insertResults) => {
            if (insertError) {
              console.error('Error inserting session data:', insertError);
              res.status(500).send('Error inserting session data');
              return;
            }
            res.cookie('sessionToken', sessionToken);
            res.redirect('/dashboard');
            

          });
        } else {
          res.status(401).send('Username or password incorrect');
        }
      });
    } else {
      res.status(401).send('Username or password incorrect');
    }
  });
});

http.listen(port);