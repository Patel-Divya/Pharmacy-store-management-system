const express = require('express');
const path = require('path');
const connection = require('../config/DB_connection'); // DataBase connection
const authenticateStore = require('../middleware/authenticateStore');

const router = express.Router();

// Define routes
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// router.get('/signup', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public', 'signup.html'));
// });

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.get('/bills', authenticateStore, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'bills.html'));
});

router.get('/dashboard', authenticateStore,(req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

router.get('/manage-stocks', authenticateStore, (req, res)=>{
  res.sendFile(path.join(__dirname, '../public', 'stocks.html'));
});

router.get('/account', authenticateStore, (req, res)=>{
  res.sendFile(path.join(__dirname, '../public', 'account.html'));
});

router.get('/logout', authenticateStore, (req, res) => {
  const sessionToken = req.cookies.sessionToken;
  
  if (sessionToken) {
    connection.query('DELETE FROM sessions WHERE session_id = ?', [sessionToken], (error, results) => {
      if (error) {
        console.error('Error deleting session data:', error);
        return;
      }
      console.log(sessionToken + " logged out");
      res.clearCookie('sessionToken');
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

// Export router
module.exports = router;
