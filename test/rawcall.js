// load the module
var sigil = require('../lib/sigil-node.js');

// create an instance of the client
var db = new sigil('localhost');

db.rawCall('/');