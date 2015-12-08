var ClientConnection = function (socket, config){

	this.socket = socket;

	// current state
	this.currentState = undefined;

	// current data handler
	this.handleInput = this.noInputHandler;
	
	// socket options
	this.socket.setTimeout(config.socketTimeout);
	this.socket.setNoDelay(true);	

	// switch to inital
	this.to('inital');

}

// |-------------------- prototype --------------------->

// switching state
ClientConnection.prototype.to = function (newState) {
	
	// does current state (we will switch from it) has onExitHandler?
	if (this.currentState && this.states[this.currentState].onExitHandler && typeof this.states[this.currentState].onExitHandler == 'function') { 
		this.states[this.currentState].onExitHandler.call(this); 
	}

	// so, now currentState set to newState
	var prevState = this.currentState; 
	this.currentState = newState;

	// does currentState has inputHandler?
	if (this.currentState && this.states[this.currentState].inputHandler && typeof this.states[this.currentState].inputHandler == 'function') {
		this.handleInput = this.states[this.currentState].inputHandler.bind(this);
	} else { 
		this.handleInput = this.noInputHandler 
	}
	
	// does currentState has onEnterHandler?
	if (this.states[this.currentState].onEnterHandler && typeof this.states[this.currentState].onEnterHandler == 'function') { 
		this.states[this.currentState].onEnterHandler.call(this, prevState); 
	}

	// for chaining
	return this;
}


// loopback for state with undefined handleInput
ClientConnection.prototype.noInputHandler = function(){};

// <-------------------- prototype ---------------------|



// ------------- here we define our states --------------

ClientConnection.prototype.states  = {
	

	'inital': {
		'onEnterHandler': function(){
			
			console.log('Client connected.');

			// socket events
			this.socket.on('timeout', function() {this.to('socket-timeout');}.bind(this));
			this.socket.on('end', function() {this.to("socket-end");}.bind(this));
			this.socket.on('error', function (exc) {this.to("socket-error").handleInput(exc);}.bind(this));
			this.socket.on('close', function () {this.to("socket-close");}.bind(this));
			this.socket.on('data', function (data) {this.handleInput(data);}.bind(this)); 
					
			this.to("waitingForHelloFromClient");
		}
	},
			

	
	'waitingForHelloFromClient':{
		'onEnterHandler': function() {
			console.log('Waiting for hello from client...')
		},
		'inputHandler': function (data){
			console.log('Client: ' + data);
			this.to('sayingHelloToClient');
		}
	},
	
	
	
	'sayingHelloToClient': {
		'onEnterHandler': function () {
			var phrase = 'Hello client!';
			console.log('Me: ' + phrase);			
			this.socket.write(phrase);
			this.to('waitingForGoodbyeFromClient');
		}
	},
	
	
	'waitingForGoodbyeFromClient':{
		'onEnterHandler': function() {
			console.log('Waiting for goodbye from client...')
		},
		'inputHandler': function (data){
			console.log('Client: ' + data);
			this.to('sayingGoodbyeToClient');
		}
	},

	
	'sayingGoodbyeToClient': {
		'onEnterHandler': function () {
			var phrase = 'Goodbye client!';
			console.log('Me: ' + phrase);
			this.socket.write(phrase);
			this.to('waitingForClientDisconnect');
		}
	},	
	
	
	'waitingForClientDisconnect': {
		'onEnterHandler': function () {
			console.log('Waiting for client disconnect...'); 
		}
	},	  
	
 
	// -----------------------------------------

	// 
	'socket-end':{
		'onEnterHandler': function() {
			console.log('Client disconnected.');
		}
			
	},

	'socket-close':{
		'onEnterHandler': function() {
			console.log('Socket closed.');
		}
	},
	
	'socket-error':{
		'onEnterHandler': function () {
		},
		'inputHandler': function (err){
			console.log('Socket error: ' + err.toString());
		}
	},

	'socket-timeout':{
		'onEnterHandler': function(prevState) {
			console.log('Socket timeout @ ' + prevState + '. I will disconnect client.');			
			this.socket.end();
		}
	}

};



// export
module.exports = ClientConnection;	