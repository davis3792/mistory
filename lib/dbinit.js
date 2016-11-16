var Q = require('kew');
var logger = require('../lib/logger.js');
var errorUtil = require('../lib/errorUtil.js');
var mongodb = require('mongodb');

module.exports = function dbinit(context) {
	var defer = Q.defer();
	var self = this;

	console.log("dbiniting");

	var mongoEndpoint = process.env.MONGO_ENDPOINT || "//localhost/mistory";

	console.log("dbinit: mongoEndpoint=",mongoEndpoint);
	//mongodb.connect('mongodb:' + mongoEndpoint, {PromiseLibrary: Q}, function(err, db) {
	mongodb.connect('mongodb:' + mongoEndpoint, function(err, db) {
		if (err) {
			return defer.reject("Unable to connect to " + mongoEndpoint + ":" + err);
		} else {
			return defer.resolve(db);
		}
	});


	return defer.promise;
};

