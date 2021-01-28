const dotenv = require('dotenv');
dotenv.config();
  
module.exports = {
    production : process.env.PRODUCTION || 'dev',
    port : process.env.PORT || 3001,
    cookieSecret : process.env.COOKIE_SECRET || 'dev',
    jwtSecret : process.env.JWT_SECRET || 'dev',
    clientSecret : process.env.CLIENT_SECRET || 'dev',
    uuid :  process.env.UUID || 'dev'
};
