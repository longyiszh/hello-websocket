"use strict";

const path = require('path');
const http = require('http');

const express = require('express');
const logger = require('morgan');
const socket = require('socket.io');



const app = express();

// dev logger
app.use(logger('dev'));

// static files
const clientPath = path.join(__dirname,'./www/');

app.use(express.static(clientPath));

// root router
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath,'index.html'))
});

// listen on port
const server = http.createServer(app);

server.listen(1024, 'localhost', () => {
  console.log('** express started on port 1024. **');
});

// set up socket.io
const io = socket(server);

io.on('connection', (socket) => {
  console.log(`socket ${socket.id} connected`);

  socket.on('chat', (data) => {
    io.sockets.emit('chat', data);
  });
});