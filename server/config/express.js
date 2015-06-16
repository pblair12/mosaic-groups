var express = require('express');
var passport = require('passport');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var config = require('./config');

module.exports = function(app) {
  app.set('views', config.rootPath + '/server/views');
  app.set('view engine', 'jade');
  app.use(logger('combined'));
  app.use(bodyParser());
  app.use(cookieSession({secret: 'mosaic groups unicorns'}));
  app.use(passport.initialize());
  app.use(passport.session());

  // ensure that all public requests go to the /public directory
  app.use(express.static(config.rootPath + '/public'));
};