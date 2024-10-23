var socket = io('/dashboard');

function request(name){
    socket.emit('request', name);
}

socket.on('getCount', (data) =>{
    const {count} = data[0];
    const {sales} = data[1];

    count.forEach (id =>{
        const {name, count} = id;
        document.getElementById(name).innerHTML = count;
    });

    sales.forEach (id =>{
        const {duration, sales} = id;
        document.getElementById(duration).innerHTML = 'Rs'+sales;
    });
});
 
socket.on('getData', (data) =>{
    const {list, name} = data;
    
    if(name == 'stock'){
        getTH(list, 'stock');
        getTD_stock(list);
    }
    else{
        getTD_data(list, 'data');
        getTH(list, 'data');
    }
});



function getTH(Data, id){
    //console.log(Data);
    const column = Object.keys(Data[0]);
    const head = document.querySelector('#'+id+"-head");

    let tags = "<tr>";
    for(i=0; i< column.length; i++){
        tags += `<th>${column[i]}</th>`;
    }
    tags += "</tr>";
    
    head.innerHTML = tags;
}


function getTD_data(Data, id){
    const tbody = document.querySelector('#'+id+'-body');
    let tags = "";

    Data.map (d =>{
        tags += `<tr>
            <td>${d.name}</td>
            <td>${d.manufacture}</td>
            <td>${d.quantity}</td>
            <td>${d.MFD}</td>
            <td>${d.EXP}</td>
            <td>${d.price}</td>
            </tr>`;
    })
    tbody.innerHTML = tags;
}

function getTD_stock(Data){
    const tbody = document.querySelector('#stock-body');
    let tags = "";

    Data.map (d =>{
        tags += `<tr>
            <td>${d.name}</td>
            <td>${d.manufacture}</td>
            <td>${d.drug_use}</td>
            <td>${d.power}</td>
            <td>${d.quantity}</td>
            <td>${d.MFD}</td>
            <td>${d.EXP}</td>
            <td>${d.additional_info}</td>
            <td>${d.price}</td>
            </tr>`;
    })
    tbody.innerHTML = tags;
}