var net = require('net');
var ServerConnection = require('./ServerConnection.js');

var config = {"socketTimeout":10000, "port": 30000, "host" : "localhost"}

var socket = net.connect(config.port, config.host, function() {
	new ServerConnection(socket, config);
});
