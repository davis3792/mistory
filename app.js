var express = require('express');
var consign = require('consign');
var requestLogger = require('./lib/requestLogger');
var errorUtil = require('./lib/errorUtil');
var cors = require('cors');
 
var app = express();

app.use(cors());

/*
var router = express.Router();
app.use('/api/v0', router);

console.log(errorUtil.inspectAll(router));
*/

var context = {};
context.app = app;

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
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

var port = process.env.API_PORT || 3001;
app.listen(port, function() {
    console.log('server listening on port ' + port);
});
