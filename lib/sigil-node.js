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
