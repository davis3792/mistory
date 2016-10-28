var util = require('util');
var logger = require('../lib/logger.js');

module.exports.handleError = 
function handleError(err) {
        if(!util.isError(err) && err.errorCode && err.errorMessage) {
                logger.error("HE: standard error payload %s", inspectAll(err));
                return err;
        } else if(util.isError(err)) {
                logger.error("HE: isError: %s", err.stack);
                return internalServerError();
        } else {
                logger.error("HE: Error payload not recognized: %s", inspectAll(err));
                return internalServerError();
        }
};

module.exports.inspectAll =
function inspectAll(o) {
        return(util.inspect(o, { showHidden: true, depth: null }));
}

module.exports.internalServerError = 
function internalServerError() {
        logger.error("Internal server error:", new Error().stack);
        return myError(500, 'Internal server error');
};

module.exports.myError = 
function myError(code, message) {
        return { errorCode: code, errorMessage: message };
};

