let logger = require('tracer').console({ format: '{{title}}: {{message}} (in {{file}}:{{line}})' });

module.exports = logger;
