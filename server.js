import tracer from 'tracer';
import logger from './server/config/logger';
import express from 'express';
import https from 'https';
import http from 'http';
import config from './server/config/config';
import * as constants from './server/config/constants';

let app = express();

if (process.env.NODE_ENV !== constants.test) {
    tracer.setLevel('log');
} else {
    tracer.setLevel('warn');
}

logger.log('Configuring Express');
require('./server/config/express')(app);

logger.log('Configuring Mongoose');
require('./server/config/mongoose')();

logger.log('Configuring Passport');
require('./server/config/passport')();

logger.log('Configuring routes');
require('./server/config/routes')(app);

logger.log('Configuring scheduler');
require('./server/config/scheduler')();

logger.log(`Starting HTTP listener on port: ${config.http.port}`);
http.createServer(app).listen(config.http.port);

if (config.env === constants.DEV) {
    logger.log(`Starting HTTPS listener on port: ${config.https.port}`);
    https.createServer(config.https.options, app).listen(config.https.port);
}

export default app;
