const connection = require('../config/DB_connection');
const authenticateStore = require('../middleware/authenticateStore_socket');
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

module.exports = (io) =>{
    io.use(authenticateStore);

    async function count(storeId) {
        var count = [];
        var sales = [];
    
        try {
            //count multiple criteria of the stock
            const count1 = await queryAsync(`select count(*) as count from drugs where sid=${storeId} and datediff(EXP, curdate()) < 30`);
            count.push({ name: 'item_about_exp', count: count1[0].count });
    
            const count2 = await queryAsync(`select count(*) as count from drugs where sid=${storeId} and quantity <= 10`);
            count.push({ name: 'about_out_of_stock', count: count2[0].count });
    
            const count3 = await queryAsync(`select count(*) as count from drugs where sid=${storeId} and quantity = 0`);
            count.push({ name: 'out_of_stock', count: count3[0].count });
    
            const count4 = await queryAsync(`select count(*) as count from drugs where sid=${storeId}`);
            count.push({ name: 'stock', count: count4[0].count });
    
            const count5 = await queryAsync(`select count(*) as count from drugs where sid=${storeId} and EXP < curdate()`);
            count.push({ name: 'EXPed', count: count5[0].count });


            //count sales
            const sales1 = await queryAsync(`SELECT SUM(total_price) AS today_sales FROM store_bills WHERE sid=${storeId} AND DATE(Date_time) = CURDATE();`);
            sales.push({ duration: 'today_sales', sales: sales1[0].today_sales});

            const sales2 = await queryAsync(`SELECT SUM(total_price) AS this_week_sales FROM store_bills WHERE sid=${storeId} AND YEARWEEK(Date_time) = YEARWEEK(NOW());`);
            sales.push({ duration: 'this_week_sales', sales: sales2[0].this_week_sales});

            const sales3 = await queryAsync(`SELECT SUM(total_price) AS monthly_sales FROM store_bills WHERE sid=${storeId} AND MONTH(Date_time) = MONTH(NOW()) AND YEAR(Date_time) = YEAR(NOW());`);
            sales.push({ duration: 'monthly_sales', sales: sales3[0].monthly_sales});

            const sales4 = await queryAsync(`SELECT SUM(total_price) AS past_30_day_sales FROM store_bills WHERE sid=${storeId} AND Date_time >= DATE_SUB(NOW(), INTERVAL 30 DAY);`);
            sales.push({ duration: 'past_30_day_sales', sales: sales4[0].past_30_day_sales});

            const sales5 = await queryAsync(`SELECT SUM(total_price) AS this_year_sales FROM store_bills WHERE sid=${storeId} AND YEAR(Date_time) = YEAR(NOW());`);
            sales.push({ duration: 'this_year_sales', sales: sales5[0].this_year_sales});
    
            var data = [{count: count},{sales: sales}];
            
            return data;
        } catch (error) {
            console.error("Error in count function:", error);
            return data; // Return whatever data was collected before the error occurred
        }
    }

    async function getData(query){
        try {
            const results = await queryAsync(query);

            const formattedResults = results.map(item => {
                const expDate = new Date(item.EXP);     // used because of 2024-07-19T18:30:00.000Z	;here, there is some error because the date is reduceed by 1 in the server
                expDate.setDate(expDate.getDate() + 1);

                const mfdDate = new Date(item.MFD);     // used because of 2024-07-19T18:30:00.000Z	;here, there is some error because the date is reduceed by 1 in the server
                mfdDate.setDate(mfdDate.getDate() + 1);

                return {
                    ...item, // Create a shallow copy of 'item'
                    EXP: expDate.toISOString().slice(0, 10), // Format date to 'YYYY-MM-DD'
                    MFD: mfdDate.toISOString().slice(0, 10) // Format date to 'YYYY-MM-DD'
                };  
            });

            return formattedResults;
        } catch (error) {
            console.error("Error in count function:", error);
            return null; // no data will sent
        }
    }
    
    io.on('connection', async (socket) => {
        try {
            const data = await count(socket.storeId);
            //console.log(await count());
            socket.emit('getCount', data);
        } catch (error) {
            console.error("Error in socket connection:", error);
        }
    

    socket.on('request', async (id) =>{
        var result;
        //console.log('called');

        if(id == 'stock'){
            result = await getData(`select name, manufacture, drug_use, power, quantity, MFD, EXP,additional_info, price from drugs where sid=${socket.storeId} and quantity != 0 and EXP > curdate()`);
        }
        else if(id == 'item_about_exp'){
            result = await getData(`select name, manufacture, quantity, MFD, EXP, price from drugs where sid=${socket.storeId} and datediff(EXP, curdate()) < 30`);
        }
        else if(id == 'about_out_of_stock'){
            result = await getData(`select name, manufacture, quantity, MFD, EXP, price from drugs where sid=${socket.storeId} and quantity <= 10`);    
        }
        else if(id == 'out_of_stock'){
            result = await getData(`select name, manufacture, quantity, MFD, EXP, price from drugs where sid=${socket.storeId} and quantity = 0`);
        }
        else if(id == 'EXPed'){
            result = await getData(`select name, manufacture, quantity, MFD, EXP, price from drugs where sid=${socket.storeId} and EXP < curdate()`);
        }
        else{
            result = `cannot get ${id}`;
        }

        //console.log({list: result, name: id});
        socket.emit('getData', {list: result, name:id});
    });
});
}