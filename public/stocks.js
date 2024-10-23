var socket = io('/manage-stocks');
socket.emit('request_data', ' ');

socket.on('getData', (data)=>{
    const column = Object.keys(data[0]);
    const head = document.querySelector('#manage_window-head');

    let tags_head = "<tr>";
    for(let i=0; i< column.length; i++){
        tags_head += `<th>${column[i]}</th>`;
    }
    tags_head += `<th>Action</th>`;
    tags_head += "</tr>"
    head.innerHTML = tags_head;

    const tbody = document.querySelector('#manage_window-body');
    let tags_body = "";

    data.map (d =>{
    tags_body += `<tr>
            <td>${d.name}</td>
            <td>${d.manufacture}</td>
            <td>${d.drug_use}</td>
            <td>${d.power}</td>
            <td>${d.quantity}</td>
            <td>${d.MFD}</td>
            <td>${d.EXP}</td>
            <td>${d.additional_info}</td>
            <td>${d.price}</td>
            <td><button onclick = 'show_edit_window("${d.name}", "${d.manufacture}", "${d.drug_use}", "${d.power}", ${d.quantity}, "${d.MFD}", "${d.EXP}", "${d.additional_info}", ${d.price})'>Edit</button>
            <button onclick = 'drop_item("${d.name}", "${d.manufacture}", "${d.drug_use}", "${d.power}", ${d.quantity}, "${d.MFD}", "${d.EXP}", "${d.additional_info}", ${d.price})'>Remove</button></td>
            </tr>`;
    });
    tbody.innerHTML = tags_body;
});

function request_data(){
    socket.emit('request_data', ' ');
}

function show_edit_window(name, manufacture, drug_use, power, quantity, mfd, exp, additional_info, price){
    document.getElementById('name').innerText = name;
    document.getElementById('manufacture').innerText = manufacture;
    document.getElementById('use').innerText = drug_use;
    document.getElementById('power').innerText = power;
    document.getElementById('quantity').value = quantity; //input
    document.getElementById('mfd').innerText = mfd;
    document.getElementById('exp').innerText = exp;
    document.getElementById('additional_info').value = additional_info; //input
    document.getElementById('price').value = price; // input
}

function drop_item(name, manufacture, drug_use, power, quantity, mfd, exp, additional_info, price){
    const item = [{
        'name' : name,
        'manufacture': manufacture,
        'use': drug_use,
        'power': power,
        'quantity': quantity,
        'mfd': mfd,
        'exp': exp,
        'additional_info': additional_info,
        'price': price
    }];

    socket.emit('drop_item', item);
    request_data();
}

function edited(){
    const item = [{
        'name' : document.getElementById('name').innerText,
        'manufacture': document.getElementById('manufacture').innerText,
        'use': document.getElementById('use').innerText,
        'power': document.getElementById('power').innerText,
        'quantity': parseInt(document.getElementById('quantity').value),
        'mfd': document.getElementById('mfd').innerText,
        'exp': document.getElementById('exp').innerText,
        'additional_info': document.getElementById('additional_info').value,
        'price': parseFloat(document.getElementById('price').value)
    }];
    
    console.log(item);

    socket.emit('edit_item', item);
    request_data();
}
 
function cancle_edit(){
    document.getElementById('name').innerText = '';
    document.getElementById('manufacture').innerText = '';
    document.getElementById('use').innerText = '';
    document.getElementById('power').innerText = '';
    document.getElementById('quantity').value = ''; // input
    document.getElementById('mfd').innerText = '';
    document.getElementById('exp').innerText = '';
    document.getElementById('additional_info').value = ''; // input
    document.getElementById('price').value = ''; // input
}

function add_new(){
    //document.getElementById('add_new_window'). //visible true;
    console.log('add_new_window: visible true');
}

function add_item(){
    var item = [{
        'name' : document.getElementById('add_new_name').value,
        'manufacture': document.getElementById('add_new_manufacture').value,
        'use': document.getElementById('add_new_use').value,
        'power': document.getElementById('add_new_power').value,
        'quantity': parseInt(document.getElementById('add_new_quantity').value),
        'mfd': document.getElementById('add_new_mfd').value,
        'exp': document.getElementById('add_new_exp').value,
        'additional_info': document.getElementById('add_new_additional_info').value,
        'price': parseFloat(document.getElementById('add_new_price').value)
    }];

    socket.emit('add_item', item);
    request_data();
}

function cancle_add_item(){
    document.getElementById('add_new_name').value = null;
    document.getElementById('add_new_manufacture').value = null;
    document.getElementById('add_new_use').value = null;
    document.getElementById('add_new_power').value = null;
    document.getElementById('add_new_quantity').value = null;
    document.getElementById('add_new_mfd').value = null;
    document.getElementById('add_new_exp').value = null;
    document.getElementById('add_new_additional_info').value = null;
    document.getElementById('add_new_price').value = null;
}

socket.on('error', (msg)=>{
    alert(msg);
});