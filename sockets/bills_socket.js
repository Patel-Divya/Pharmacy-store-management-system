const connection = require('../config/DB_connection');
const authenticateStore = require('../middleware/authenticateStore_socket');
const util = require('util');
const queryAsync = util.promisify(connection.query).bind(connection);

module.exports = (io)=>{
  io.use(authenticateStore);

  io.on('connection', (socket)=>{
    socket.on('req_stockData', ()=>{
      connection.query(`select name, manufacture, drug_use,power,EXP, additional_info, price from drugs where sid = ${socket.storeId}`, (error, results) =>{
        if(error){
          console.log("Error in io-socket sendStockdata"+error);
          socket.emit('get_stockData', "Server error");
        }
    
        else{
          const formattedResults = results.map(item => {
            const expDate = new Date(item.EXP);     // used because of 2024-07-19T18:30:00.000Z	;here, there is some error because the date is reduceed by 1 in the server
            expDate.setDate(expDate.getDate() + 1);

            return {
                ...item, // Create a shallow copy of 'item'
                EXP: expDate.toISOString().slice(0, 10) // Format date to 'YYYY-MM-DD'
            };  
          });
          // console.log(formattedResults);
          socket.emit('get_stockData', formattedResults);
        }
      });
    });

    // for order placing
    socket.on('place_order', async (cart_info) =>{

      const {customer_name, customer_email, cart} = cart_info[0];

      if(cart.length !=0 ){
        if(await check_items(cart)){

          await addBill(customer_name, customer_email, cart);

          // crud operations
          var price_per_1_item;

          for(let i=0; i<cart.length; i++){
            const {name, manufacture, exp, no_of_items, price} = cart[i];

            price_per_1_item = price/no_of_items;
            //console.log(price_per_1_item);

            await update_stock(name, manufacture, exp, no_of_items, price_per_1_item);
            //console.log(name, manufacture, exp, no_of_items, price_per_1_item);
          }
        }
      }
      else{
        socket.emit('buy_error', 'Cart is empty Or server issue');
      }
    });

    async function check_items(cart){
      //console.log('called');

      var return_flag = false;
      var count = 0;

      for(let i=0; i<cart.length; i++){
        const {name, manufacture, exp, no_of_items} = cart[i];

        try{
          const results = await queryAsync(`select quantity from drugs where name = '${name}' and manufacture = '${manufacture}' and EXP = '${exp}'`);

          var result = results[0].quantity;

          if(result == 0){
            socket.emit('buy_error', `${name} is out of stock`);
            break;
          }
          else if(result < no_of_items){
            socket.emit('buy_error', `Cannot buy ${name} as available stock is: ${result}`);
            break;
          }
          else if(result > no_of_items){
            count++;
          }
        }
        catch(error){
          console.error("Error in check_items function:", error);
          break;
        }
      }

      if(cart.length == count ){
        return_flag = true;
      }
      
      return return_flag;
    }

    // stock of each medicine will be updated.
    async function update_stock(name, manufacture, exp, no_of_items, price_per_1_item){
      try{
        await queryAsync(`UPDATE drugs SET quantity = quantity-${no_of_items} WHERE sid=${socket.storeId} AND name = '${name}' AND manufacture = '${manufacture}' AND EXP = '${exp}' AND price = ${price_per_1_item}`);
      }
      catch(error){
        console.error('Error in update_stock() function: '+ error);
      }
    }

    async function addBill(customer_name, customer_email, cart){
      try{
        let total_price = 0;

        for(let i=0; i<cart.length; i++){
          total_price += cart[i].price;
        }

        var item_list = JSON.stringify(cart);
        if(customer_name == '') customer_name = 'Unkown';
        if(customer_email == '') customer_email = 'Unkown';

        await queryAsync(`INSERT INTO store_bills (sid, customer_name, customer_email, items, total_price) VALUES (${socket.storeId}, '${customer_name}', '${customer_email}', '${item_list}', ${total_price})`);
      }
      catch(error){
        console.log('Error in addBill(): '+error);
      }
    }
  });
}