var http = require('http');
var url = require('url');
var listObj = require('./list.json')
var site = require('fs')
var server = http.createServer(responseFunc).listen(process.env.PORT || 3000);

function responseFunc(req, res) {
  var q = url.parse(req.url,true).query;
  var data = "";
  if (q.action === "list") {
    res.writeHead(200, {'Content-Type': 'text/html'});
    let listObjStr = JSON.stringify(listObj)
    res.write(listObjStr)
    res.end()
  } else if (q.action === "addItem") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {addItem(JSON.parse(data));});
    res.end()
  } else if (q.action === "addStore") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {addStore(JSON.parse(data));});
    res.end()
  } else if (q.action === "addUser") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {addUser(data);});
    res.end()
  } else if (q.action === "removeItem") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {removeItem(JSON.parse(data));});
    res.end()    
  } else if (q.action === "removeStore") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {removeStore(JSON.parse(data));});
    res.end()
  } else if (q.action === "removeUser") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {removeUser(data);});
    res.end()
  } else if (q.action === "removePrevious") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {removePrevious(JSON.parse(data));});
    res.end();
  } else if (q.action === "clearPrevious") {
    req.on("data",function(inStream){data += inStream});
    req.on("end",function() {clearPrevious(data);});
    res.end()
  } else {
    site.readFile('site.html',function(err,data) {
      res.write(data);
      res.end()
    });
  }
  site.writeFile('./list.json', JSON.stringify(listObj), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

function addItem(addObj) {
    if (/^\!P_/.test(addObj.enteredBy)) {
      addObj.enteredBy = addObj.enteredBy.replace(/^\!P_/,'');
      eval("listObj.personal."+addObj.enteredBy+"."+addObj.name+" = {quantity: addObj.quantity, enteredBy: addObj.enteredBy, stores: addObj.stores};")
      eval(
        "if (!listObj.personal."+addObj.enteredBy+".itemArr.includes('"+addObj.name+"')) {"+
        "listObj.personal."+addObj.enteredBy+".itemArr.push(addObj.name);};"
      )
    } else {
      eval("listObj."+addObj.name+" = {quantity: addObj.quantity, enteredBy: addObj.enteredBy, stores: addObj.stores};")
      if (!listObj.itemArr.includes(addObj.name)) {
        listObj.itemArr[listObj.itemArr.length] = addObj.name;
      }
    }
}

function addStore(addObj) {
    if (/^\!P_/.test(addObj.enteredBy)) {
      addObj.enteredBy = addObj.enteredBy.replace(/^\!P_/,'');
      eval("listObj.personal."+addObj.enteredBy+".stores.push(addObj.name);")      
    } else {
      listObj.stores.push(addObj.name);
    }
}

function addUser(addObj) {
  listObj.users.push(addObj);
  eval("listObj.personal."+addObj+" = {stores: [], itemArr: []}");
  eval("listObj.personal."+addObj+".previous = {prevArr: []}");
}

function removeItem(item) {
  if (/^\!P_/.test(item.enteredBy)) {
    item.enteredBy = item.enteredBy.replace(/^\!P_/,'');
    var itemArr;
    eval("itemArr = listObj.personal."+item.enteredBy+".itemArr");
    for (i=0; i<itemArr.length; i+=1) {
      if (itemArr[i] === item.name) {
        eval("listObj.personal."+item.enteredBy+".previous.prevArr.push(listObj.personal."+item.enteredBy+".itemArr[i])");
        eval("listObj.personal."+item.enteredBy+".itemArr.splice(i,1)");
        eval("listObj.personal."+item.enteredBy+".previous."+item.name+" = listObj.personal."+item.enteredBy+"."+item.name+";");
        eval("delete listObj.personal."+item.enteredBy+"."+item.name+";");
        break;
      }
    }
  } else {
    for (i=0; i<listObj.itemArr.length; i+=1) {
      if (listObj.itemArr[i] === item.name) {
        listObj.itemArr.splice(i,1);
        eval("listObj.previous.prevArr.push('"+item.name+"');");
        eval("listObj.previous."+item.name+" = listObj."+item.name+";");
        eval("delete listObj."+item.name+";");
        break;
      }
    }
  }
}

function removeStore(store) {
  if (/^\!P_/.test(store.enteredBy)) {
    store.enteredBy = store.enteredBy.replace(/^\!P_/,'');
    var storeArr;
    eval("storeArr = listObj.personal."+store.enteredBy+".stores") 
    for (i=0; i<storeArr.length; i+=1) {
      if (storeArr[i] === store.name) {
        eval("listObj.personal."+store.enteredBy+".stores.splice(i,1)");
        eval("listObj.personal."+store.enteredBy+".previous."+store.name+" = listObj.personal."+store.enteredBy+"."+store.name+";");
        eval("delete listObj.personal."+store.enteredBy+"."+store.name+";");
        break;
      }
    }
  } else {
    for (i=0; i<listObj.stores.length; i+=1) {
      if (listObj.stores[i] === store.name) {
        listObj.stores.splice(i,1);
        eval("delete listObj."+store.name+";");
        break;
      }
    }
  }
}
function removeUser(user) {
  for (i=0; i<listObj.users.length; i+=1) {
    if (listObj.users[i] === user) {
      listObj.users.splice(i,1);
      eval("delete listObj.personal."+user+";");
      break;
    }
  }
}

function removePrevious(delObj) {
  if (/^\!P_/.test(delObj.enteredBy)) {
    delObj.enteredBy = delObj.enteredBy.replace(/^\!P_/,'');
    let spot;
    eval(
      "spot = listObj.personal."+delObj.enteredBy+".previous.prevArr.indexOf(delObj.name);"+
      "listObj.personal."+delObj.enteredBy+".previous.prevArr.splice(spot, 1);"
    )
    eval("delete listObj.personal."+delObj.enteredBy+".previous."+delObj.name+";")
  } else {
    let spot = listObj.previous.prevArr.indexOf(delObj.name);
    listObj.previous.prevArr.splice(spot, 1);
    eval("delete listObj.previous."+delObj.name+";")
  }
}

function clearPrevious(user) {
  if (/^\!P_/.test(user)) {
    user = user.replace(/^\!P_/,'');
    eval("listObj.personal."+user+".previous = {prevArr: []}") 
  } else {
    listObj.previous = {prevArr: []};
  }
}
