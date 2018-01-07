let logger = require('./logger');
let mongoose = require('mongoose');
let userModel = require('../models/User');
let groupsModel = require('../models/Group'); //eslint-disable-line
let semesterModel = require('../models/Semester');
let settingsModel = require('../models/Settings');
let config = require('./config');

module.exports = function () {
    mongoose.Promise = Promise;

    if (process.env.NODE_ENV !== 'test') {
        mongoose.set('debug', config.db.debugMode);
        mongoose.connect(config.db.url);
    }
    else {
        let mockgoose = require('mockgoose').Mockgoose;

        mockgoose = new mockgoose(mongoose);
        mockgoose.prepareStorage().then(() => {
            mongoose.connect('mongodb://foobar/baz');
            mongoose.connection.on('connected', () => {

                //connection is open
            });
        });

    }

    //setting own Promise library. See: http://mongoosejs.com/docs/promises.html

    logger.log(`connecting to ${config.env} mongo instance`);

    logger.log('connected...');

    let db = mongoose.connection;
    db.on('error',
        function (err) {
            logger.error('connection error: %s', err);
        });
    db.once('open', function callback() {
        logger.log('mosaicgroups db opened');
    });

    // Create default semester xw
    semesterModel.createDefaultSemester();
    // create default users on server start if users are empty
    userModel.createDefaultUsers();
    // create default settings on server start if settings are empty
    settingsModel.createDefaultSettings();
};
