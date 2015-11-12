var express = require("express");
var path = require("path");
var app = express();


app.use(express.static(path.join(__dirname, './client')));
app.use('/node_modules',express.static(__dirname + '/node_modules'))

app.set('views', __dirname + '/client/views/');
app.set("view engine", 'ejs');

require('./server/routes.js')(app);

var server = app.listen(8000, function() {
	console.log("listening on port 8000");
})

var io = require('socket.io').listen(server)
var messages = [];
var users = {};


io.sockets.on('connection', function (socket) {
  console.log("WE ARE USING SOCKETS!");
  var socketID = socket.id;
  socket.emit('initial', messages);
  
  socket.on('login', function(user){
    socketID = socket.id;
  	message = user.name + " has just joined the chat"
  	users[socketID] = user.name;
  	socket.broadcast.emit('new_user', message)
  })
  
  socket.on('new_message', function(message){
  	messages.push(message);
  	io.sockets.emit('all_messages', messages);
  })

  socket.on('disconnect', function(){
    message = users[socketID] + " just logged out";
    socket.broadcast.emit("log_out", message);
    delete users[socketID];
  })
})