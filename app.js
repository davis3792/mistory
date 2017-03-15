var express = require('express');
var consign = require('consign');
var requestLogger = require('./lib/requestLogger');
var errorUtil = require('./lib/errorUtil');
var cors = require('cors');
var dbinit = require('./lib/dbinit.js');
var body_parser = require('body-parser');
 
var app = express();

app.use(cors());
app.use(body_parser.json());

/*
var router = express.Router();
app.use('/api/v0', router);

console.log(errorUtil.inspectAll(router));
*/

var context = {};
context.app = app;

dbinit()
.then(function(db) {
	context.db = db;

	consign()
	  .include('middleware')
	  .then('models')
	  .then('controllers')
	  .then('routers')
	  .into(context);

	console.log("consigned");

	app.use(function(req, res, next) {
		next({
			"errorCode": 404,
			"errorMessage": 'There is nothing here o_0'
		});
	});

	app.use(function(err, req, res, next) {
		// we only get here if next is called with an error
		if (err) {
                	var e = errorUtil.handleError(err);
                	res.status(e.errorCode).json(e);
        	}
	});

	var port = process.env.API_PORT || 3001;
	app.listen(port,"0.0.0.0", function() {
	    console.log('server listening on port ' + port);
	});

})
.fail(function(err) {
	errorUtil.fatalError(err);
})
.done();
