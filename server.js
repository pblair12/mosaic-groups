var tracer = require('tracer');
var logger = require('./server/config/logger');
var express = require('express');
var https = require('https');
var http = require('http');
var config = require('./server/config/config');
require('newrelic');

var app = express();

if (process.env.NODE_ENV !== 'test') {
  tracer.setLevel('log');
}
else {
  tracer.setLevel('warn');
}
logger.log('configuring express');
require('./server/config/express')(app);

logger.log('configuring mongoose');
require('./server/config/mongoose')();

logger.log('configuring passport');
require('./server/config/passport')();

logger.log('configuring routes');
require('./server/config/routes')(app);

logger.log('configuring scheduler');
require('./server/config/scheduler')();

logger.log('environment: ' + config.env);

logger.log('configuring listener for http on port: ' + config.http.port);
http.createServer(app).listen(config.http.port);

//if (config.env === 'development') {
//  logger.log('configuring listener for https on port: ' + config.https.port);
//  https.createServer(config.https.options, app).listen(config.https.port);
//}

logger.log("Listening on port " + config.http.port);

module.exports = app;
