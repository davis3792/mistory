var Q = require('kew');
var logger = require('../lib/logger');
var querystring = require('querystring');

module.exports = function(context) {

	var shows = context.models.shows;

	this.findById = function(req, res, next) {

		shows.findById(req.params.id)
		.then(function(results) {
			res.status(200).json(results);
		})
		.fail(function(err) {
			res.status(err.errorCode).json(err);
		})
		.done();
	};
	this.findByIdSeason = function(req, res, next) {

		shows.findByIdSeason(req.params.id, req.params.season)
		.then(function(results) {
			res.status(200).json(results);
		})
		.fail(function(err) {
			res.status(err.errorCode).json(err);
		})
		.done();
	};
	this.findByIdSeasonEpisode = function(req, res, next) {

		shows.findByIdSeasonEpisode(req.params.id, req.params.season, req.params.episode)
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

	return this;
};
