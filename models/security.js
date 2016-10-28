var Q = require('kew');
var jwt = require('jsonwebtoken');
var logger = require('../lib/logger.js');
var errorUtil = require('../lib/errorUtil.js');


module.exports = function(app) {

        this.hasValidToken = function(req) {
		return _verifyAuthorizationHeader(req);
	};

	return this;
};

function _verifyAuthorizationHeader(req) {

	console.log(req.headers.authorization);
	if(!req.headers.authorization) {
		logger.error("No Auth header");
		return Q.resolve(false);
	}

	try {
		jwt.verify(req.headers.authorization, 'asdf789');
		var tokenData = _tokenData(req);
		if(tokenData.type !== 'apikey') {
			logger.error("token missing type=apikey");
			return Q.resolve(false);
		} else {
			return Q.resolve(true);
		}
	} catch(err) {
		logger.error("failed verifying token");
		return Q.resolve(false);
	}

	// should never hit this since the calls above are all synchronous.
	assert("Should not get here.");
	return Q.promise;
}

function _tokenData(req) {
	return jwt.decode(req.headers.authorization, 'asdf789');
}
