const dotenv = require('dotenv');
dotenv.config();
const isDev = ( process.env.PRODUCTION || 'dev' ) === 'dev';
let production, port, cookieSecret, jwtSecret, clientSecret, uuid

if( !isDev ){
    production = process.env.PRODUCTION;
    port = process.env.PORT;
    cookieSecret = process.env.COOKIE_SECRET;
    jwtSecret = process.env.JWT_SECRET;
    clientSecret = process.env.CLIENT_SECRET;
    uuid = process.env.UUID;
} else {
    production = 'dev';
    port = '3001';
    cookieSecret = 'dev';
    jwtSecret = 'dev';
    clientSecret = 'dev';
    uuid = 'dev';
}

  
module.exports = {
    production : production,
    port : port,
    cookieSecret : cookieSecret,
    jwtSecret : jwtSecret,
    clientSecret : clientSecret,
    uuid :  uuid
};
