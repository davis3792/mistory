var winston = require('winston');
var getNamespace = require('continuation-local-storage').getNamespace;

var logger = new (winston.Logger)({
    "exitOnError" : true,
    "transports" : [
            new (winston.transports.Console)({
                "level" : "info",
                "colorize" : false,
                "timestamp": function() {
                    return new Date().toISOString();
                },
                "formatter": function(options) {
                    return formatMessage(options);
                }
            }),
    ]
});


String.prototype.append = function (name,value) {
   if(value) {
       return this + (this && this !== '' ? ', ' : '') + name + (name ? '=' : '') + value;
   }

   return this;
};

function formatMessage(options) {

    var meta = "";
    for ( var name in options.meta) {
        meta = meta.append(name, options.meta[name]);
    }

    return options.timestamp() + ' ' + ''
        .append('level', options.level.toUpperCase())
        .append('logguid', getNamespaceValue('logguid', 'main'))
        .append('', meta)
        .append('message', '"' + (options.message ? options.message : '' + (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : ''))  + '"');
}

function getNamespaceValue(val, def) {
    var namespace = getNamespace('mistory');
    return namespace && namespace.get(val) ? namespace.get(val) : def;
}

logger.stream = {
    write : function(message, encoding) {
        logger.info(chomp(message));
    }
};

logger.duration = function(start) {
    if(!start) {
        return null;
    }
   
    var now = process.hrtime();
    return ((now[0] - start[0]) * 1e3 + (now[1] - start[1]) * 1e-6).toFixed(3);
};

function chomp(raw_text) {
  return raw_text.replace(/(\n|\r)+$/, '');
}

module.exports = logger;
