var socket = io('/bills');
var cart = [];

// CRUD operation on cart
function update_cart_window(name, manufacture, exp, no_of_items){
    document.getElementById('name').innerText = name;
    document.getElementById('manufacture').innerText = manufacture;
    document.getElementById('exp').innerText = exp;
    document.getElementById('no_of_items').value = no_of_items;
}

function update_cart(){
    var name = document.getElementById('name').innerText;
    var manufacture = document.getElementById('manufacture').innerText;
    var exp = document.getElementById('exp').innerText;
    var no_of_items = document.getElementById('no_of_items').value;

    if(no_of_items == 0){
        remove_from_cart(name, manufacture, exp);
    }
    else{
        var index = -1;
        for( let i=0; i<cart.length; i++){
            if(cart[i].name === name && cart[i].manufacture === manufacture && cart[i].exp === exp){
                index = i;
                break;
            }
        }
        if(index!= -1){
            var price_per_1_item = cart[index].price / cart[index].no_of_items;

            cart[index].no_of_items = no_of_items;
            cart[index].price = no_of_items * price_per_1_item;
        }
    }

    show_cart();
}

function remove_from_cart(name, manufacture, exp){
    var index = -1;
    for( let i=0; i<cart.length; i++){
        if(cart[i].name === name && cart[i].manufacture === manufacture && cart[i].exp === exp){
            index = i;
            break;
        }
    }
    if (index !== -1) {
        cart.splice(index, 1);
        show_cart();
    }
}

function add(name, manufacture, exp, price){
    document.getElementById(name).innerHTML = parseInt(document.getElementById(name).innerText)+1;

    let no_of_items = 1;

    //console.log(no_of_items);
    var item = {
        "name" : name,
        "manufacture" : manufacture,
        "exp" : exp,
        "no_of_items" : no_of_items,
        "price" : no_of_items*price,
    };
    
    var index = -1;
    for( let i=0; i<cart.length; i++){
        if(cart[i].name === name && cart[i].manufacture === manufacture && cart[i].exp === exp){
            index = i;
            break;
        }
    }

    if(index != -1){
        cart[index].no_of_items += no_of_items;
        cart[index].price += no_of_items*price;
    }
    else{
        cart.push(item);
    }
    //alert(name + " added");

    //console.log(cart);

    show_cart();
}

function drop_cart(){
    cart = [];
    select_stock_ok();
    show_cart();
}
    
//display data
function show_add_window(){
    socket.emit('req_stockData'); 

    socket.on('get_stockData', function(data){
        const column = Object.keys(data[0]);
            const head = document.querySelector('#select_stock-head');

            let tags_head = "<tr>";
            for(let i=0; i< column.length; i++){
                tags_head += `<th>${column[i]}</th>`;
            } 
            tags_head += `<th>No. of item</th>`;
            tags_head += `<th>Buttons</th>`;
            tags_head += "</tr>"
            head.innerHTML = tags_head;

            const tbody = document.querySelector('#select_stock-body');
            let tags_body = "";

            data.map (d =>{
                tags_body += `<tr>
                    <td>${d.name}</td>
                    <td>${d.manufacture}</td>
                    <td>${d.drug_use}</td>
                    <td>${d.power}</td>
                    <td>${d.EXP}</td>
                    <td>${d.additional_info}</td>
                    <td>${d.price}</td>
                    <td id='${d.name}'>0</td>
                    <td><button onclick = 'add("${d.name}", "${d.manufacture}", "${d.EXP}", "${d.price}")'>Click to add</button></td>
                    </tr>`;
            });
            tbody.innerHTML = tags_body;
    });
}

function show_cart(){
    if(cart.length == 0){
        document.querySelector('#cart-head').innerHTML = ' ';
        document.querySelector('#cart-body').innerHTML = 'No data';

        document.getElementById('cart-total_price').innerText = 'No data';
    }
    else{
        //put column name
        const column = Object.keys(cart[0]);
        const thead = document.querySelector('#cart-head');

        let tags_head = '<tr>';
        for(let i=0; i<column.length; i++){
            tags_head += `<th>${column[i]}</th>`;
        }
        tags_head += '</tr>';
        thead.innerHTML = tags_head;

        //put tupples
        const tbody = document.querySelector('#cart-body');
        let tags_body = "";

        cart.map(d =>{
            tags_body += `<tr>
                <td>${d.name}</td>
                <td>${d.manufacture}</td>
                <td>${d.exp}</td>
                <td>${d.no_of_items}</td>
                <td>${d.price}</td>
                <td><button onclick = "update_cart_window('${d.name}', '${d.manufacture}', '${d.exp}', ${d.no_of_items})">Edit</button></td>
                <td><button onclick = "remove_from_cart('${d.name}', '${d.manufacture}', '${d.exp}')">Remove</button></td>
                </tr>`;
        });
        tbody.innerHTML = tags_body;
    
        var total_price = 0;
        for(let i=0; i<cart.length; i++) total_price += cart[i].price;

        document.getElementById('cart-total_price').innerText = total_price;
    }
}

// events for server
function place_order(){
    if(cart.length == 0){
        alert('No items in the cart');
    }
    else {
        document.querySelector('#customer_name').value;
        

        var cart_info = [{
            'customer_name': document.querySelector('#customer_name').value,
            'customer_email': document.querySelector('#customer_email').value,
            'cart': cart
        }]
        console.log(cart_info);
        socket.emit('place_order', cart_info);
    }
}

function select_stock_ok(){

    // temprory below
    document.getElementById('select_stock-head').innerHTML = " ";
    document.getElementById('select_stock-body').innerHTML = " ";
}

socket.on('buy_error',(error)=>{
    alert(error);
});