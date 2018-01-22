import path from 'path';

//Environnment Variables
export const DEV = 'development';
export const PROD = 'production';
export const TEST = 'test';

//Development HTTPS Config
export const DEV_KEY_PATH = path.normalize(`${__dirname}/../../dev.key`);
export const DEV_CERT_PATH = path.normalize(`${__dirname}/../../dev.cert`);
export const DEV_CSR_PATH = path.normalize(`${__dirname}/../../dev.csr`);
export const DEV_CERT_SUBJ = '"/CN=localhost/O=Mosaic Groups Dev/C=US"';

//Database Connection String
export const DEV_DB_CONN = 'mongodb://localhost:27017/mosaicgroups';
const PROD_DB_HOST = 'ds027489.mongolab.com:27489/mosaicgroups';
export const PROD_DB_CONN = `mongodb://${process.env.MOSAICGROUPS_USERNAME}:${process.env.MOSAICGROUPS_PASSWORD}@${PROD_DB_HOST}`;


//Domain Configuration
export const DEV_DOMAIN = 'localhost';
export const PROD_DOMAIN = 'www.mosaicgroups.org';



