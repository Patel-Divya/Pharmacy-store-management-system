const connection = require('../config/DB_connection');
const authenticateStore = require('../middleware/authenticateStore_socket');
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

module.exports = (io)=>{
    io.use(authenticateStore);
}