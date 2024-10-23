const connection = require('../config/DB_connection');
const authenticateStore = require('../middleware/authenticateStore_socket');

module.exports = (io) =>{
    io.use(authenticateStore);

    function count(){
        var data = [];

        connection.query(`select count(*) as count from drugs where datediff(EXP, curdate()) < 30`, (error, results) => {
            if(error){
                console.log("Error in io-socket sendStockdata"+error);
                data.push({name: 'item_about_exp', count: 'Server error'});
            }
            else{
                data.push({name: 'item_about_exp', count: results[0].count});
                //console.log(data);
            }
        });

        connection.query(`select count(*) as count from drugs where quantity <= 10`, (error, results) => {
            if(error){
                console.log("Error in io-socket sendStockdata"+error);
                data.push({name: 'about_out_of_stock', count: 'Server error'});
            }
            else{
                data.push({name: 'about_out_of_stock', count: results[0].count});
                //console.log(data);
            }
        });

        connection.query(`select count(*) as count from drugs where quantity = 0`, (error, results) => {
            if(error){
                console.log("Error in io-socket sendStockdata"+error);
                data.push({name: 'out_of_stock', count: 'Server error'});
            }
            else{
                data.push({name: 'out_of_stock', count: results[0].count});
                //console.log(data);
            }
        });

        connection.query(`select count(*) as count from drugs`, (error, results) => {
            if(error){
                console.log("Error in io-socket sendStockdata"+error);
                data.push({name: 'stock', count: 'Server error'});
            }
            else{
                data.push({name: 'stock', count: results[0].count});
                //console.log(data);
            }
        });

        connection.query(`select count(*) as count from drugs where EXP < curdate()`, (error, results) => {
            if(error){
                console.log("Error in io-socket sendStockdata"+error);
                data.push({name: 'EXPed', count: 'Server error'});
            }
            else{
                data.push({name: 'EXPed', count: results[0].count});
                //console.log(data);
            }
        });

        return data;
    }

    io.on('connection', (socket) =>{
        console.log(count());
        //socket.emit('getCount', )
    });
}