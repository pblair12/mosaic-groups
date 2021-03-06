let express = require('express');
let passport = require('passport');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let cookieSession = require('cookie-session');
let config = require('./config');
let logger = require('./logger');

var forceSsl = function (req, res, next) {
    logger.log("req.headers['x-forwarded-proto'] = " + req.headers['x-forwarded-proto']);
    if (config.env === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        logger.log("req.headers['x-forwarded-proto'] = " + req.headers['x-forwarded-proto']);
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};

module.exports = function (app) {
    app.set('views', config.rootPath + '/server/views');
    app.set('view engine', 'jade');
    if (config.env !== 'test') {
        let requestLogFormat = '\x1b[34mRequest:\x1b[0m [:date[iso]](:remote-addr): ":method :url HTTP/:http-version" :status :res[content-length]';
        app.use(morgan(requestLogFormat));
    }
    app.use(forceSsl);
    app.use(bodyParser());
    app.use(cookieSession({ secret: 'mosaic groups unicorns' }));
    app.use(passport.initialize());
    app.use(passport.session());

    // ensure that all public requests go to the /public directory
    app.use(express.static(config.rootPath + '/public'));
};