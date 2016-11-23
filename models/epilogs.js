var Q = require('kew');
var request = require('request');
var logger = require('../lib/logger.js');
var errorUtil = require('../lib/errorUtil.js');
var querystring = require('querystring');
var MongoDB = require('mongodb');

var cn = 'Epilogs';

module.exports = function(context) {


	this.create = function(req) {

		// Use the defer anti pattern to avoid collisions
		// between kew and the promise library used by the mongo client.
		// There should be a better way to handle this but haven't seen it yet.
		var defer = Q.defer();

		var body = req.body;

		var _etag = MongoDB.Long.fromNumber(new Date().getTime());

		var newEpilog = {
			source: body.source,
			userId: 1,
			nickName: body.nickName,
			title: body.title,
			detail: body.detail,
			status: body.status,
			avgRating: 0,
			_etag: _etag
		}

		context.db.collection(cn).insertOne(newEpilog, {fullResult:true})
		.then(function(mongoRes) {
			// not sure if this is the right way to extract the payload posted from the response
			var r = mongoRes.ops[0];
			var newEpilogRes = {
				id: r._id,
				source: r.source,
				userId: r.userId,
				nickName: r.nickName,
				title: r.title,
				detail: r.detail,
				status: r.status,
				avgRating: r.avgRating,
				etag: r._etag.toString(10),
			}

			defer.resolve(newEpilogRes);
		})
		.catch(function(err) {
			defer.reject(err);
		});

		return defer.promise;
	};

	this.findById = function(id) {
		var defer = Q.defer();

		context.db.collection(cn).findOne({_id:MongoDB.ObjectId(id)})
		.then(function(mongoRes) {
			var res;
			if (mongoRes) {
				var res = {
					id: id,
					source: mongoRes.source,
					userId: mongoRes.userId,
					nickName: mongoRes.nickName,
					title: mongoRes.title,
					detail: mongoRes.detail,
					status: mongoRes.status,
					avgRating: mongoRes.avgRating,
					etag: mongoRes._etag,
				}
				return defer.resolve(res);
			} else {
				return defer.reject(errorUtil.myError(404,"Not found."));
			}
		})
		.catch(function(err) {
			console.error("err is:", err);
			defer.reject(err);
		});

		return defer.promise;

	};

	this.find = function(query) {
		var defer = Q.defer();

		var ftsearch = false;
		var fieldMatch = false;

		console.log("query:",query);
                var queryKeys = Object.keys(query);
                for (var i = 0; i<queryKeys.length ; i++) {
                        var k = queryKeys[i];
                        switch(k) {
                                case "search": 
					ftsearch = true;
                                        break;
                                case "source.Title": 
					fieldMatch = true;
                                        break;
                                case "nickName": 
					fieldMatch = true;
                                        break;
                                case "status": 
					fieldMatch = true;
                                        break;
                                default:
                                        return Q.reject(errorUtil.myError(400, "Invalid query string parameter: " + k));
                        }
                }

		if (ftsearch && fieldMatch) {
			logger.info("Can not mix full text search and field matching");
			return Q.reject(errorUtil.myError(400, "Can not mix full text search and field matching"));
		}

		if (ftsearch) {
			var searchValue = query.search;
			query = { "$text": { "$search": searchValue}}; 
		}

		console.log("query=", query);
		context.db.collection(cn).find(query).toArray()
		.then(function(mongoRes) {
			var res;
			if (mongoRes) {
				console.log("mongoRes=", mongoRes);
				res = mongoRes.map(function(epilog) {
					return {
						id: epilog._id,
						etag: epilog._etag,
						source: epilog.source,
						userId: epilog.userId,
						nickName: epilog.nickName,
						title: epilog.title,
						detail: epilog.detail,
						status: epilog.status,
						avgRating: epilog.avgRating,
					}
				});
				return defer.resolve(res);
			} else {
				logger.error("Mongo find returned a null response");
				return defer.reject(errorUtil.myError(500, "Internal server error"));
			}
		})
		.catch(function(err) {
			console.error("err is:", err);
			defer.reject(err);
		});

		return defer.promise;

	};


	this.remove = function(id) {
		var defer = Q.defer();

		var _id = MongoDB.ObjectId(id);

		context.db.collection(cn).findOneAndDelete({"_id": _id})
		.then(function(mongoRes) {
			if (mongoRes.lastErrorObject.n === 0) logger.error("Delete id " + id + " not found but will considered successful (idempotent)");
			console.log("mongoRes=", mongoRes);
			return defer.resolve();
		})
		.catch(function(err) {
			return defer.reject(err);
		});

		return defer.promise;
	}

	this.update = function(etag, id, body) {
		var defer = Q.defer();

		var _etag = MongoDB.Long.fromNumber(etag);
		var _id = MongoDB.ObjectId(id);

		var updateEpilog = {
			source: body.source,
			userId: body.userId,
			nickName: body.nickName,
			title: body.title,
			detail: body.detail,
			status: body.status,
			avgRating: body.avgRating
		};

		context.db.collection(cn).findAndModify(
				{"_id":_id, "_etag": _etag},   // filter/search criteria
				{}, // sort (unspecified) 
				{$set: updateEpilog, $inc: {_etag:1}},  // data to be updated.  increment the etag
				{new:true})  // return the post update data
		.then(function(mongoRes) {
			console.log("mongoRes=", mongoRes);
			if (mongoRes) {
				var le = mongoRes.lastErrorObject;

				if (le && le.updatedExisting === true && le.n === 1) {
					var updatedEpilogRes = {
						id: mongoRes.value._id,
						etag: mongoRes.value._etag,
						source: mongoRes.value.source,
						userId: mongoRes.value.userId,
						nickName: mongoRes.value.nickName,
						title: mongoRes.value.title,
						detail: mongoRes.value.detail,
						status: mongoRes.value.status,
						avgRating: mongoRes.value.avgRating,
					}
					console.log("updatedEpilogRes=", updatedEpilogRes);
					return defer.resolve(updatedEpilogRes);
				} else {
					// determine why put failed (record missing or etag mismatch?)
					context.db.collection(cn).findOne({_id:MongoDB.ObjectId(id)})
					.then(function(mongoRes) {
						if (mongoRes) {
							logger.error("Put failed but record with ID " + id + " found, must be an etag miss (" + etag + ")");
							return defer.reject(errorUtil.myError(412, "Entity tag " + etag + " does not match"));
						} else {
							logger.error("Put failed because record with ID " + id + " not found");
							return defer.reject(errorUtil.myError(404, "Not found"));
						}
					})
					.catch(function(err) {
						logger.error("Error occurred determining why put failed: ", err);
						return defer.reject(err);
					});	
				}

			} else {
				logger.error("Mongo returned a null response");
				return defer.reject(errorUtil.myError(500, "Internal server error"));
			}
		})
		.catch(function(err) {
			console.error("err is:", err);
			return defer.reject(err);
		});

		return defer.promise;

	};
	return this;
};

