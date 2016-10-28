var request = require('request');
var logger = require('./logger');

require('request-debug')(request, function(type, data, r) {
    if(type == 'request') {
        r._startAt = process.hrtime();
        logger.info("Outgoing request " + r.method + " " + r.href);
    } else if(type == 'response') {
        logger.info("Incoming response " + r.method + " " + r.href, {duration:logger.duration(r._startAt), statusCode:data.statusCode});
        //logger.info("Incoming response " + r.method);
    }
});
