const connection = require('../config/DB_connection');
const authenticateStore = require('../middleware/authenticateStore_socket');
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

module.exports = (io)=>{
    io.use(authenticateStore);

    io.on('connection', (socket)=>{
        socket.on('request_data', async (temp)=>{
            try{
                const results = await queryAsync(`SELECT name, manufacture, drug_use, power, quantity, MFD, EXP, additional_info, price FROM drugs WHERE sid = ${socket.storeId}`);

                const formattedResults = results.map(item => {
                    const expDate = new Date(item.EXP);     // used because of 2024-07-19T18:30:00.000Z	;here, there is some error because the date is reduceed by 1 in the server
                    expDate.setDate(expDate.getDate() + 1);

                    const mfdDate = new Date(item.MFD);     // used because of 2024-07-19T18:30:00.000Z	;here, there is some error because the date is reduceed by 1 in the server
                    mfdDate.setDate(mfdDate.getDate() + 1);
        
                    return {
                        ...item, // Create a shallow copy of 'item'
                        MFD: mfdDate.toISOString().slice(0,10),
                        EXP: expDate.toISOString().slice(0, 10) // Format date to 'YYYY-MM-DD'
                    };  
                  });

                socket.emit('getData', formattedResults);
            }catch(error){
                console.log('Error in request_data (manage_stock_socket): '+error);
                socket.emit('error', 'Unable to load the stocks');
            }
        });

        socket.on('edit_item', (item)=>{
            const {name, manufacture, use, power, quantity, mfd, exp, additional_info, price} = item[0];

            if(check_item(item)){
                connection.query(`UPDATE drugs SET quantity=${quantity}, additional_info='${additional_info}', price=${price} WHERE sid=${socket.storeId} AND name='${name}' AND manufacture='${manufacture}' AND power='${power}' AND drug_use='${use}' AND MFD='${mfd}' AND EXP='${exp}'`, (error, result)=>{
                    if(error){
                        console.log("Error to edit the item in manage_stock_socket: "+error);
                        socket.emit('error', 'Item not found');
                    }
                    else{
                        socket.emit('error', 'Item updated');
                    }
                });
            }
            else{
                socket.emit('error', 'Cannot edit NULL items');
            }
        });

        socket.on('drop_item', (item)=>{
            const {name, manufacture, use, power, quantity, mfd, exp, additional_info, price} = item[0];
            if(check_item(item)){
                connection.query(`DELETE FROM drugs WHERE sid=${socket.storeId} AND name='${name}' AND manufacture='${manufacture}' AND power='${power}' AND drug_use='${use}' AND MFD='${mfd}' AND EXP='${exp}' AND quantity=${quantity} AND additional_info='${additional_info}' AND price=${price}`, (error, result)=>{
                    if(error){
                        console.log("Error to edit the item in manage_stock_socket: "+error);
                        socket.emit('error', 'Item not found');
                    }
                    else{
                        socket.emit('error', 'Item Removed');
                    }
                });
            }
            else{
                socket.emit('error', 'Cannot remove NULL items');
            }
        });

        function check_item(item){
            var {name, manufacture, use, power, quantity, mfd, exp, additional_info, price} = item[0];

            var flag = false;
            if((price !== null && price !== 0) && (quantity !== null && quantity >= 0) && (name && name.trim() !== '') && (manufacture && manufacture.trim() !== '') && (use && use.trim() !== '') && (power && power.trim() !== '') && (mfd && mfd.trim() !== '') && (exp && exp.trim() !== '') && (additional_info && additional_info.trim() !== '')){
                flag = true;
            }
            
            return flag;
        }

        socket.on('add_item', (item)=>{
            const {name, manufacture, use, power, quantity, mfd, exp, additional_info, price} = item[0];

            if(check_item(item)){
                connection.query(`INSERT INTO drugs (sid, name, manufacture, drug_use, power, quantity, MFD, EXP, additional_info, price) VALUES (${socket.storeId}, '${name}', '${manufacture}', '${use}', '${power}', ${quantity}, '${mfd}', '${exp}', '${additional_info}', ${price})`, (error, result)=>{
                    if(error){
                        console.log("Error to edit the item in manage_stock_socket: "+error);
                        socket.emit('error', 'Item cannot be added');
                    }
                    else{
                        socket.emit('error', 'Item added!');
                    }
                });
            }
            else{
                socket.emit('error', 'Cannot add NULL items');
            }
        });
    });
}