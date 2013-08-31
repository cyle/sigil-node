// load the module
var sigil = require('../lib/sigil');

// create an instance of the client
var db = new sigil('localhost', 8777);

// test out get nodes
console.log('testing getting all nodes');
db.nodes(function(err, data) {
	console.log(data);
})

// test out get connections
console.log('testing getting all connections');
db.connections(function(err, data) {
	console.log(data);
});

// does a connection exist
console.log('testing getting whether a connection exists between nodes 10 and 5');
db.doesConnectionExist(10, 5, function(err, data) {
	console.log(data);
});

// does a connection exist
console.log('testing getting whether a connection exists between nodes 7 and 8');
db.doesConnectionExist(7, 8, function(err, data) {
	console.log(data);
});

// get shortest path
console.log('testing getting the shortest path between nodes 1 and 12');
db.shortestPath(1, 12, function(err, data) {
	if (err) { console.log(err); }
	console.log(data);
});