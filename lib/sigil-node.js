/*

	SIGIL-NODE CLIENT MODULE
		by cyle gage

*/

// sigil client constructor
var SIGIL = module.exports = function(hostname, port) {
	if (hostname == undefined && port == undefined) {
		this._hostname = 'localhost';
		this._port = '8777';
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
	if (data == undefined) {
		data = {};
	}
	if (typeof callback !== 'function') {
		throw new Error("callback is not a function!");
	}
	var reqOptions = this._httpOptions;
	reqOptions.path = path;
	reqOptions.method = type;
	var req = http.request(reqOptions, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		var fulldata = '';
		res.on('data', function(chunk) {
			fulldata += chunk;
		});
		res.on('end', function() {
			console.log('BODY: ' + fulldata);
		});
	});
	req.on('error', function(e) {
		console.log('error doing raw call...');
		console.log(e);
		//throw new Error('error doing raw call...');
	});
	if (type == 'POST') {
		req.write(data);
	}
	req.end();
}


// test function
SIGIL.prototype.returnTest = function() {
	return 'lol';
}

// callback test function
SIGIL.prototype.callbackTest = function(callback) {
	if (typeof callback !== 'function') { throw new Error("callback is not a function!"); }
	callback('wut?');
}