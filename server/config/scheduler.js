let logger = require('./logger');
let schedule = require('node-schedule');
let emailer = require('../utilities/emailer');
let config = require('./config');

module.exports = function () {
    if (config.scheduler.enabledGroupReport) {
        let rule = new schedule.RecurrenceRule();
        rule.minute = config.scheduler.minute;
        rule.hour = config.scheduler.hour;

        logger.log('A groups report will be sent every day at hour: ' + rule.hour + ' minute: ' + rule.minute);
        let j = schedule.scheduleJob(rule, function () {
            emailer.sendGroupsReport();
        });
    } else {
        logger.log('Group reports are currently disabled');
    }

    if (config.scheduler.enabledDistinctMembersReport) {
        let rule = new schedule.RecurrenceRule();
        rule.minute = config.scheduler.minute;
        rule.hour = config.scheduler.hour;

        logger.log('A distinct members report will be sent every day at hour: ' + rule.hour + ' minute: ' + rule.minute);
        let i = schedule.scheduleJob('0 0 * * 0', function () {
            emailer.sendDistinctMembersReport();
        });
    } else {
        logger.log('Distinct members reports are currently disabled');
    }
};
