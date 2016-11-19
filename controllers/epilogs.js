var Q = require('kew');
var logger = require('../lib/logger');
var querystring = require('querystring');

module.exports = function(context) {

	var epilogs = context.models.epilogs;

	this.create = function(req, res, next) {

		//console.log("controller: req.body",req.body);

		return epilogs.create(req)
		.then(function(results) { 
			res.set('Content-Location', req.path + "/" + results.id);
			res.set('ETag', results.etag);
			delete results.id;
			delete results.etag;
			res.status(201).json(results);
		})
		.fail(function(err) {
			res.status(err.errorCode).json(err);
		})
		.done();
	};

	this.findById = function(req, res, next) {

		return epilogs.findById(req.params.id)
		.then(function(results) {
			res.set('Content-Location', req.path);
			res.set('ETag', results.etag);
			delete results.id;
			delete results.etag;
			res.status(200).json(results);
		})
		.fail(function(err) {
			next(err);
		})
		.done();
	};

	this.find = function(req, res, next) {

		console.log("controller req.query:", req.query);

		return epilogs.find(req.query)
		.then(function(results) {
			res.set('Content-Location', req.path);
			res.set('ETag', results.etag);
			delete results.id;
			delete results.etag;
			res.status(200).json(results);
		})
		.fail(function(err) {
			next(err);
		})
		.done();
	};

	this.delete = function(req, res, next) {

		return epilogs.remove(req.params.id)
		.then(function(results) {
			res.status(204).end();
		})
		.fail(function(err) {
			next(err);
		})
		.done();
	};

	this.update = function(req, res, next) {

		return epilogs.update(req.headers.etag, req.params.id, req.body)
		.then(function(results) {
			res.set('Content-Location', req.path);
			res.set('ETag', results.etag);
			delete results.id;
			delete results.etag;
			res.status(200).json(results);
		})
		.fail(function(err) {
			next(err);
		})
		.done();
	};

	return this;
};
