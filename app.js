#!/usr/bin/env node

require('./database').connect();
var config = require('./config/config.json');
/**
 * Module dependencies.
 */

var socket = require('./socket');
var debug = require('debug')('expresssocket:server');
var http = require('http');
var sticky = require('socketio-sticky-session');
var redis = require('socket.io-redis');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
socket.set('port', port);

/**
 * Create HTTP server.
 */

var server = sticky({ num: 1 }, function () {
  let ser = http.createServer(socket);
  var io = socket.io;
  io.attach(ser)
  io.adapter(redis(config.redis))
  return ser
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, function () {
});;
server.on('error', onError);
server.on('listening', onListening);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }
  
  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


