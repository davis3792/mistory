var express = require('express');
var consign = require('consign');
var requestLogger = require('./lib/requestLogger');
var errorUtil = require('./lib/errorUtil');
 
var app = express();

/*
var router = express.Router();
app.use('/api/v0', router);

console.log(errorUtil.inspectAll(router));
*/


consign()
  .include('middleware')
  .then('models')
  .then('controllers')
  .then('routers')
  .into(app);

console.log("consigned");

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

var port = 3001;
app.listen(port, function() {
    console.log('server listening on port ' + port);
});
