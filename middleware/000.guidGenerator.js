var uuid = require('node-uuid');
var createNamespace = require('continuation-local-storage').createNamespace;

var namespace = createNamespace('mistory');

module.exports = function(context) {
        context.app.use(function(req, res, next) {
                var tid = uuid.v4();

                namespace.bindEmitter(req);
                namespace.bindEmitter(res);

                namespace.run(function() {
                        namespace.set('logguid', tid);
                        next();
                });
        });
};

