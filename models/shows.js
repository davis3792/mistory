var Q = require('kew');
var request = require('request');
var logger = require('../lib/logger.js');
var errorUtil = require('../lib/errorUtil.js');
var querystring = require('querystring');

//request.debug=true;

module.exports = function(context) {

	this.findById = function(id) {
		return getShowURL('?i=' + id);
	};

	this.findByIdSeason = function(id,season) {
		return getShowURL('?i='+id + '&season='+season);
	};

	this.findByIdSeasonEpisode = function(id,season,episode) {
		return getShowURL('?i='+id + '&season='+season + '&episode='+episode);
	};

	this.search = function(query) {

		var omdbQueryObj = {};
		var queryKeys = Object.keys(query);
		//Object.keys(query).forEach(function(k) {
		for (var i = 0; i<queryKeys.length ; i++) {
			var k = queryKeys[i];
			switch(k) {
				case "title": 
					omdbQueryObj.s = query[k];
					break;
				case "type": 
					omdbQueryObj[k] = query[k];
					break;
				default:
					return Q.reject(errorUtil.myError(400, "Invalid query string parameter: " + k));
			}
		}

		var omdbQuery = querystring.stringify(omdbQueryObj);
		return getShowURL('?'+omdbQuery);
	};

	return this;
};

function getShowURL(params) {
		var fn = 'getShowURL';

		var defer = Q.defer();

		//var reqUri = 'http://www.omdbapi.com/?i=' + id;
		var reqUri = 'http://www.omdbapi.com/' + params;

		request({
			uri : reqUri,
			method : 'GET',
			headers : {
				'Content-Type' : 'application/json',
				'Accept' : 'application/json'
			}
		}, function(error, res, body) {
			if (error) {
				logger.error(fn + ':API error:', error);
				defer.reject(errorUtil.handleError(error));
			} else {
				logger.info(fn + ':API result:', body);
				logger.info(fn + ':res.statusCode:', res.statusCode);

				//var jsonBody = body.trim() ? JSON.parse(body) : {};

				var jsonBody = JSON.parse(body);

				if (res.statusCode === 200) {
					if (jsonBody.Response === 'True') {
						defer.resolve(jsonBody);
					} else {
						defer.reject(errorUtil.myError(400, jsonBody.Error));
					}
				} else {
					defer.reject(errorUtil.myError(res.statusCode, jsonBody));
				}
			}
		});

		return defer.promise;
}
