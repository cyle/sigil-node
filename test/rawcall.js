// load the module
var sigil = require('../lib/sigil');

// create an instance of the client
var db = new sigil;

// db.rawCall('/node', 'POST', {'Name':'a new node!'}, function(err, result) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log('the new node ID: ' + result);
// 	}
// });

db.rawCall('/nodes', function(err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});