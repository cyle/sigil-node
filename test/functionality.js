console.log('this should return "localhost", "lol", and then "wut?"');

// load the module
var sigil = require('../lib/sigil-node.js');

// create an instance of the client
var db = new sigil('localhost');

// see if it set that hostname correctly
console.log(db.getHostname());

// see if it uses that method correctly
console.log(db.returnTest()); 

// see if this callback works correctly
db.callbackTest(function(message) {
	console.log(message); 
});