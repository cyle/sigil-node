# sigil-node

A client library for talking to the [SIGIL](https://github.com/cyle/sigil) spatial and graph database.

## Installing

Run `npm install sigil`, that's all.

## Usage

### Connecting

Require the `sigil` module:

    var sigil = require('sigil');

Now make a new instance of the SIGIL client class:

    var db = new sigil();

By default, this assumes your sigil database is running on `localhost` via port `8777`. To change this, set the first argument of the constructor to the hostname or IP, and the second argument to the port number. (If you leave the port blank, `80` is assumed.)

    var db = new sigil('your-host-here.com', 8721);

That's it.

### Callbacks and Error Handling

Since Node.js is meant to be asynchronous, all sigil database functionality requires a callback function, like so:

    db.nodes(function(err, data) {
        if (err) { console.log('there was an error: ' + err); }
        console.log(data);
    });

All callbacks expect two parameters: the first being an error message, the second being the data that given back from the database. The error is always a string, usually a `404 Not Found` error or something of that type. The data can be a boolean, an object, an array, number, or string, depending on what you're doing.

If you call a sigil function with incorrect parameters, the module will throw an error at you. If you call a sigil function with correct parameters but the database doesn't find a result or has some kind of issue, then the `err` callback function will be populated. If there is no error from the database, `err` will be undefined or null.

### Querying

To get all of the nodes in the database, which will return an array of node objects:

	db.nodes(function(err, nodes) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(nodes); // an array of nodes, even if there are none
	});

To get all of the connections in the database, which will return an array of connection objects:

	db.connections(function(err, connections) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(connections); // an array of connections, even if there are none
	});

To get a specific node, where the first parameter is the unique ID of the node you want:

	db.node(22, function(err, node) {
	    if (err) { console.log('there was an error: ' + err); } // this will throw if there is no node ID #22
	    console.log(node); // this will be node ID #22
	});

To get a specific connection, where the only parameter is the unique ID of the connection you want:

	db.connection(15, function(err, connection) {
	    if (err) { console.log('there was an error: ' + err); } // this will throw if there is no connection ID #15
	    console.log(connection); // this will be connection ID #15
	});

To get all of the connections attached to a specific node, where the first parameter is the unique ID of the node you want connections for:

	db.nodeConnections(22, function(err, connections) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(connections); // this will be an array of connections
	});

To get all of the nodes connected (adjacent) to a specific node, where the first parameter is the unique ID of the node you want adjacent nodes for:

	db.adjacentNodes(22, function(err, nodes) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(nodes); // this will be an array of nodes, even if there are none
	});

To get the shortest path between two nodes, where the first parameter is the source node ID and the second parameter is the target node ID:

	db.shortestPath(13, 22, function(err, connections) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(connections); // this will be an array of connections that lead from source to target
	});

To get the Euclidean distance between two nodes:

	db.distanceBetween(13, 22, function(err, distance) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(distance); // a floating point number
	});

To get the closest node to a given node, in this case the closest node to node ID 13:

	db.closestNode(13, function(err, node) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(node); // the node closest to node ID #13
	});

To get all nearby nodes within a certain radius of a given node, in this case all nodes within 10 units of node ID 4:

	db.nearbyNodes(4, 10, function(err, nodes) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(nodes); // an array of nodes within a radius of 10 units from node ID #4
	});

What they return is dependent on what you asked for. I tried to name the above result-holding variables in a way that would hint at what you'll get back.

### Creating Nodes and Connections

To create a new node, do this:

	db.newNode('A new node!', 2, 3, 4, { 'huh': 'what' }, function(err, new_id) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(new_id); // the ID of the new node
	});

The argument list is: node name, X, Y, Z, extra info, and callback. Technically, you can send `null` values to any or all of the parameters except for the callback, and it'll make you a new node. The data that is returned is the new node's unique ID.

To create a new connection, do this:

	db.newConnection('A new connection!', 14, 24, function(err, new_id) {
	    if (err) { console.log('there was an error: ' + err); }
	    console.log(new_id); // the ID of the new connection
	});

The argument list is: connection name, source node ID, target node ID, and callback. You **must** supply source and target node IDs. You can send `null` to the name argument if you don't care about it. The data that is returned is the new connections's unique ID.

### Updating Nodes and Connections

Updating nodes and connections are very similar, in that you must supply the complete object with whatever modifications you've made, like so:

	db.updateNode({ 'ID': 22, 'Name': 'Updated node!', 'X': 10, 'Y': 15, 'Z': 0, 'Extra': null }, function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

The most important bit is that you **must** set the unique `ID` of what you want to update in the object passed to the `updateNode` method. It works similarly for connections:

	db.updateConnection({ 'ID': 5, 'Name': 'Updated connection!', 'Source': 10, 'Target': 3 }, function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

Except in the case of a connection, you **must** supply the `ID`, `Source`, and `Target` properties, even if you haven't changed them.

### Deleting Nodes and Connections

To delete a specific node, first parameter being the ID you'd like deleted:

    db.deleteNode(22, function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

That will delete the node with the unique ID 22, and all of the connections attached to that node.

To delete a specific connection:

	db.deleteConnection(5, function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

That will delete the connection with the unique ID 5.

To delete all nodes (and, consequently, all connections):

	db.deleteNodes(function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

That will result in `true` on success, `err` on failure for some reason.

To delete all connections:

	db.deleteConnections(function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

That will result in `true` on success, `err` on failure for some reason.

### Saving the Database to Disk

By default, anything done in a SIGIL database is not persistent unless you tell the database to save itself to disk. You can do this with this client:

    db.save(function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true on success, error would've been thrown on fail
	});

That'll make sure the database is saved to disk. Next time the database restarts, it'll have your data loaded automatically.

At the time of this writing, the SIGIL database does not save by itself in any fashion. You have to explicitly tell it to save the current graph.

### Helper Methods

If you want to check whether or not two nodes are already connected:

    db.doesConnectionExist(4, 9, function(err, result) {
		if (err) { console.log('there was an error: ' + err); }
		console.log(result); // will be true or false
	});

That will return `true` if a connection already exists between node IDs 4 and 9. It will return `false` otherwise.

### Advanced Usage

You can do a raw call to the database by using the "rawCall()" method, like so:

	db.rawCall('/nodes', function(err, data) { // this will get all of the nodes as an array
		if (err) { console.log('there was an error: ' + err); }
		console.log(data);
	});
	
	db.rawCall('/node', 'POST', { 'Name': 'A new node!' }, function(err, data) { // this will manually make a new node
		if (err) { console.log('there was an error: ' + err); }
		console.log(data);
	});
	
	db.rawCall('/node/4', 'DELETE', function(err, data) { // this will manually delete a node
		if (err) { console.log('there was an error: ' + err); }
		console.log(data);
	});

The methods of the SIGIL class will do most of this for you, but you could do it yourself this way if you really wanted.

For `rawCall()`, you can send up to four arguments: the path of the API call as a string, the HTTP method to use, any data you'd like to send along, and the callback function. The method defaults to 'GET', and the data defaults to `null`. The callback function will return either the expected result within its second parameter, or an error message in the first parameter.