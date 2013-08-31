/*

	SIGIL-NODE CLIENT MODULE
		by cyle gage

*/

var http = require('http');
var url = require('url');

// sigil client constructor
var SIGIL = module.exports = function(hostname, port) {
	if (hostname == undefined && port == undefined) {
		this._hostname = 'localhost';
		this._port = 8777;
	} else {
		this._hostname = hostname;
		this._port = port;
	}
	this._httpOptions = {
		hostname: this._hostname,
		port: this._port
	};
}

// send back what hostname we're using
SIGIL.prototype.getHostname = function() {
	return this._hostname;
}

SIGIL.prototype.rawCall = function(path, type, data, callback) {
	if (path == undefined || path == '') {
		throw new Error("you must at least supply a path");
	}
	if (type == undefined) {
		type = 'GET';
	} else if (typeof type === 'function') {
		callback = type;
		type = 'GET';
	}
	type = type.toUpperCase();
	if (data == undefined) {
		data = {};
	} else if (typeof data === 'function') {
		callback = data;
		data = {};
	}
	if (typeof callback !== 'function') {
		throw new Error("callback is not a function!");
	}
	var reqOptions = this._httpOptions;
	reqOptions.path = path;
	reqOptions.method = type;
	var req = http.request(reqOptions, function(res) {
		if (res.statusCode != 200 && res.statusCode != 201) {
			// ran into an error
			callback('error, received status code: ' + res.statusCode, null);
			return;
		}
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		var fulldata = '';
		res.on('data', function(chunk) {
			fulldata += chunk;
		});
		res.on('end', function() {
			//console.log('BODY: ' + fulldata);
			var result = fulldata;
			try {
				result = JSON.parse(fulldata); // is it JSON? if it is, parse it
			} catch (e) {
				 result = fulldata; // otherwise, just return the string
			}
			if (type == 'POST') {
				if (res.headers.location != undefined) { // if location is defined, it means we made something new!
					var returnedLocation = url.parse(res.headers.location);
					var getNewID = /\/(\d+)/.exec(returnedLocation.pathname);
					if (getNewID == null) {
						callback('error, no new ID returned', null);
						return;
					}
					var newID = getNewID[1] * 1;
					callback(null, newID);
				} else { // otherwise, we just updated an existing thing, and it returned 200, so we're cool
					callback(null, true);
				}
			} else if (type == 'DELETE') {
				callback(null, true); // deleted object, we're cool
			} else {
				callback(null, result); // dunno what you did, probably GET something, so return it
			}
		});
	});
	req.on('error', function(e) {
		console.log('error doing raw call...');
		console.log(e);
		callback('error doing raw call', null);
		//throw new Error('error doing raw call...');
	});
	if (type == 'POST') {
		req.write(JSON.stringify(data)); // if there is data to send, send as JSON
	}
	req.end();
}

/*

	just querying things and simple operations

*/

SIGIL.prototype.nodes = function(callback) {
	this.rawCall('/nodes', callback);
}

SIGIL.prototype.connections = function(callback) {
	this.rawCall('/connections', callback);
}

SIGIL.prototype.node = function(id, callback) {
	this.rawCall('/node/' + id, callback);
}

SIGIL.prototype.connection = function(id, callback) {
	this.rawCall('/connection/' + id, callback);
}

SIGIL.prototype.nodeConnections = function(id, callback) {
	this.rawCall('/node/' + id + '/connections', callback);
}

SIGIL.prototype.adjacentNodes = function(id, callback) {
	this.rawCall('/node/' + id + '/adjacent', callback);
}

SIGIL.prototype.shortestPath = function(source, target, callback) {
	this.rawCall('/shortest/from/' + source + '/to/' + target, callback);
}

SIGIL.prototype.distanceBetween = function(source, target, callback) {
	this.rawCall('/distance/from/' + source + '/to/' + target, callback);
}

SIGIL.prototype.nearbyNodes = function(id, r, callback) {
	this.rawCall('/nodes/nearby/' + id + '/radius/' + r, callback);
}

SIGIL.prototype.closestNode = function(id, callback) {
	this.rawCall('/node/closest/' + id, callback);
}

/*

	making new things

*/

SIGIL.prototype.newNode = function(name, x, y, z, extra, callback) {
	var newnode = {};
	newnode.Name = name;
	newnode.X = x;
	newnode.Y = y;
	newnode.Z = z;
	newnode.Extra = extra;
	this.rawCall('/node', 'POST', newnode, callback);
}

SIGIL.prototype.newConnection = function(name, source, target, callback) {
	if (source == undefined || target == undefined) {
		throw new Error('You must supply both a source node and target node when creating a new connection.');
	}
	var newconn = {};
	newconn.Name = name;
	newconn.Source = source;
	newconn.Target = target;
	this.rawCall('/connection', 'POST', newconn, callback);
}

/*

	updating things

*/

SIGIL.prototype.updateNode = function(obj, callback) {
	if (obj.hasOwnProperty('ID') == false) {
		throw new Error('To update a node, you must provide at least an ID in the given object.');
	}
	this.rawCall('/node', 'POST', obj, callback);
}

SIGIL.prototype.updateConnection = function(obj, callback) {
	if (obj.hasOwnProperty('ID') == false) {
		throw new Error('To update a connection, you must provide at least an ID in the given object.');
	}
	if (obj.hasOwnProperty('Source') == false) {
		throw new Error('To update a connection, you must provide a Source node ID.');
	}
	if (obj.hasOwnProperty('Target') == false) {
		throw new Error('To update a connection, you must provide a Target node ID.');
	}
	this.rawCall('/connection', 'POST', obj, callback);
}

/*

	deleting things

*/

SIGIL.prototype.deleteNode = function(id, callback) {
	this.rawCall('/node/' + id, 'DELETE', callback);
}

SIGIL.prototype.deleteConnection = function(id, callback) {
	this.rawCall('/connection/' + id, 'DELETE', callback);
}

SIGIL.prototype.deleteNodes = function(callback) {
	this.rawCall('/nodes', 'DELETE', callback);
}

SIGIL.prototype.deleteConnections = function(callback) {
	this.rawCall('/connections', 'DELETE', callback);
}

/*

	other useful stuff

*/

SIGIL.prototype.save = function(callback) {
	this.rawCall('/save', callback);
}

SIGIL.prototype.doesConnectionExist = function(source, target, callback) {
	this.rawCall('/connections', function(err, data) {
		if (err || data.length == 0) {
			callback(null, false);
		} else {
			var found = false;
			for (c = 0; c < data.length; c++) {
				if ( (data[c].Source == source && data[c].Target == target) || (data[c].Source == target && data[c].Target == source) ) {
					found = true;
					callback(null, true);
					break;
				}
			}
			if (!found) {
				callback(null, false);
			}
		}
	});
}