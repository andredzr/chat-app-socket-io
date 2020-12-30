"use strict";
const { Socket } = require('dgram');
const { ClientRequest } = require('http');

var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
let connections = [];
http.listen(port);

let getListOfUsers = function () {
  return connections.map(socket => socket.username);
};
let setUserTyping = function (index) {
  return connections.map(
    (socket, indexMap) =>
    (index === indexMap ?
      ('✍ ••• ' + socket.username + " <i>is typing</i>.")
      : socket.username));
};
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', function (socket) {
  connections.push(socket);
  socket.on('join', function () {
    socket.username = 'Anonymous';
    io.emit('update', 'Someone has joined the server.');
    io.emit('list users', getListOfUsers());
  });
  socket.on('disconnect', function () {
    io.emit('update', 'A user has disconnected.');
    connections.splice(connections.indexOf(socket), 1);
    io.emit('list users', getListOfUsers());
  });
  socket.on('chat message', function (msg) {
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('change username', newUsername => {
    socket.username = newUsername;
    io.emit('list users', getListOfUsers());
  });
  socket.on('typing', function () {
    io.emit('list users', setUserTyping(connections.indexOf(socket)));
  });
  socket.on('not typing', function () {
    io.emit('list users', getListOfUsers());
  });
});

