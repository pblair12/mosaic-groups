import path from 'path';
import fs from 'fs';
import { execSync }from 'child_process';
import logger from './logger';
import * as constants from './constants';

const rootPath = path.normalize(__dirname + '/../../client/');

let env = process.env.NODE_ENV = process.env.NODE_ENV || constants.DEV;
logger.log(`Current Environment Type: ${env}`);

let corsOrigins = [];
if (env === constants.PROD && process.env.MOSAIC_ORIGINS) {
    corsOrigins = process.env.MOSAIC_ORIGINS.split(';');
}

if (env === constants.DEV) {
    if (!fs.existsSync(constants.DEV_KEY_PATH) || !fs.existsSync(constants.DEV_CERT_PATH)) {
        logger.log('Creating Development HTTPS Key and Certificate...');
        const command = `
            openssl genrsa -out ${constants.DEV_KEY_PATH} 1024 &&
            openssl req -new -key ${constants.DEV_KEY_PATH} -out ${constants.DEV_CSR_PATH} -subj ${constants.DEV_CERT_SUBJ}
            openssl x509 -req -in ${constants.DEV_CSR_PATH} -signkey ${constants.DEV_KEY_PATH} -out ${constants.DEV_CERT_PATH}`;
        try {
            execSync(command, {stdio: ['ignore', 'ignore', 'ignore']});
        } catch (error) {
            logger.error('Failed to Generate HTTPS Key and Certificate.');
            logger.error(error.message);
        }
    } else { logger.log('Located Development HTTPS Key and Certificate');}
}
  
const envs = {
    development: {
        env: env,
        domain: constants.DEV_DOMAIN,
        db: {
            url: constants.DEV_DB_CONN,
            debugMode: true
        },
        root: rootPath,
        http: { port: 3030 },
        https: {
            port: 3031,
            options: {
                key: fs.readFileSync(constants.DEV_KEY_PATH),
                cert: fs.readFileSync(constants.DEV_CERT_PATH)
            }
        },
        scheduler: {
            enabledGroupReport: false,
            enabledDistinctMembersReport: false
        },
        emailer: { password: process.env.MOSAIC_GROUPS_EMAIL_PASSWORD },
        origins: corsOrigins
    },
    production: {
        env: env,
        domain: constants.PROD_DOMAIN,
        db: {
            url: constants.PROD_DB_CONN,
            debugMode: false
        },
        root: rootPath,
        http: { port: process.env.PORT || 80 },
        https: { port: process.env.SSLPORT || 443 },
        scheduler: {
            enabledGroupReport: false,
            enabledDistinctMembersReport: false,
            hour: 11,
            minute: 59
        },
        emailer: { password: process.env.MOSAIC_GROUPS_EMAIL_PASSWORD },
        origins: corsOrigins
    }
};
envs.test = envs.development;

module.exports = envs[env];