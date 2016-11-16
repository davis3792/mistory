var Q = require('kew');
var logger = require('../lib/logger');
var querystring = require('querystring');

module.exports = function(context) {

	var users = context.models.users;

	this.create = function(req, res, next) {

		console.log("controller: req.body",req.body);

		return users.create(req)
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

		return users.findById(req.params.id)
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

		return users.remove(req.params.id)
		.then(function(results) {
			res.status(204).end();
			//res.status(204).end();
		})
		.fail(function(err) {
			next(err);
		})
		.done();
	};

	this.update = function(req, res, next) {

		return users.update(req.headers.etag, req.params.id, req.body)
		.then(function(results) {
			res.set('Content-Location', req.path);
			res.set('ETag', results.etag);
			delete results.id;
			delete results.etag;
			res.status(200).json(results);
			//res.status(204).end();
		})
		.fail(function(err) {
			next(err);
		})
		.done();
	};


	/*
	this.findByNickName = function(req, res, next) {

		shows.findByIdSeason(req.params.id, req.params.season)
		.then(function(results) {
			res.status(200).json(results);
		})
		.fail(function(err) {
			res.status(err.errorCode).json(err);
		})
		.done();
	};

	this.search = function(req, res, next) {

		shows.search(req.query)
		.then(function(results) {
			res.status(200).json(results);
		})
		.fail(function(err) {
			res.status(err.errorCode).json(err);
		})
		.done();
	};
	*/

	return this;
};
