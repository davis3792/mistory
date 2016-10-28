var logger = require('../lib/logger');
var onFinished = require('on-finished');

module.exports = function(app) {
        app.use(function(req, res, next) {
                req._startAt = process.hrtime();
                logger.info("Incoming request " + req.method + " " + req.url);

                onFinished(res, function() {
                        logger.info("Outgoing response " + req.method + " " + req.url, {
                            duration : logger.duration(req._startAt),
                            statusCode : res.statusCode
                        });
                });

                next();
        });

	return this;
};
