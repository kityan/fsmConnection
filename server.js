var net = require('net');
var ClientConnection = require('./ClientConnection.js');

var config = {"socketTimeout":3000, "port": 30000}

net.createServer(function(socket) {
    var clientConnection = new ClientConnection(socket, config);
    })
    .listen(config.port, function () {
        console.log('Listening on: ' + config.port);
    });
