var Q = require('kew');
var request = require('request');
var logger = require('../lib/logger.js');
var errorUtil = require('../lib/errorUtil.js');
var querystring = require('querystring');
var MongoDB = require('mongodb');
var mongoLong = MongoDB.Long;

var cn = 'Users';

module.exports = function(context) {


	/*
	var userSchema = new context.lib.dbinit.mongoose.Schema({
		email: String,
		nickName: String,
		createdOn: Date,
		modifiedOn: Date,
		deleted: Boolean
	});
	*/

	this.create = function(req) {

		// Use the defer anti pattern to avoid collisions
		// between kew and the promise library used by the mongo client.
		// There should be a better way to handle this but haven't seen it yet.
		var defer = Q.defer();

		var _etag = mongoLong.fromNumber(new Date().getTime());

		var newUser = {
			nickName: req.body.nickName,
			email: req.body.email,
			status: req.body.status,
			_etag: _etag
		}

		context.db.collection(cn).insertOne(newUser, {fullResult:true})
		.then(function(mongoRes) {
			// not sure if this is the right way to extract the payload posted from the response
			var r = mongoRes.ops[0];
			var newUserRes = {
				id: r._id,
				etag: r._etag.toString(10),
				nickName: r.nickName,
				email: r.email,
				status: r.status
			}

			defer.resolve(newUserRes);
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
					etag: mongoRes._etag,
					nickName: mongoRes.nickName,
					email: mongoRes.email,
					status: mongoRes.status
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

	this.findByName = function(name) {
		return 1;
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

		var _etag = mongoLong.fromNumber(etag);
		var _id = MongoDB.ObjectId(id);

		var updateUser = {
			nickName: body.nickName,
			email: body.email,
			status: body.status
		};

		context.db.collection(cn).findAndModify(
				{"_id":_id, "_etag": _etag},   // filter/search criteria
				{}, // sort (unspecified) 
				{$set: updateUser, $inc: {_etag:1}},  // data to be updated.  increment the etag
				{new:true})  // return the post update data
		.then(function(mongoRes) {
			console.log("mongoRes=", mongoRes);
			if (mongoRes) {
				var le = mongoRes.lastErrorObject;

				if (le && le.updatedExisting === true && le.n === 1) {
					var updatedUserRes = {
						id: mongoRes.value._id,
						etag: mongoRes.value._etag,
						nickName: mongoRes.value.nickName,
						email: mongoRes.value.email,
						status: mongoRes.value.status
					}
					return defer.resolve(updatedUserRes);
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

