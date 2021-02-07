const dotenv = require('dotenv');
dotenv.config();

const isDev = ( process.env.PRODUCTION || 'dev' ) === 'dev';
let production, port, cookieSecret, jwtSecret, clientSecret, uuid, apiURL, currentWeb,kakaoID,googleID,googleClient

if( !isDev ){
    production = process.env.PRODUCTION;
    port = process.env.PORT;
    cookieSecret = process.env.COOKIE_SECRET;
    jwtSecret = process.env.JWT_SECRET;
    clientSecret = process.env.CLIENT_SECRET;
    uuid = process.env.UUID;
    apiURL = process.env.API_URL;
    currentWeb = process.env.CURRENT_WEB;
    kakaoID = process.env.KAKAO_ID;
    googleID = process.env.GOOGLE_clientID;
    googleClient = process.env.GOOGLE_ClientSecret;
} else {
    production = 'dev';
    port = '3003';
    cookieSecret = 'dev';
    jwtSecret = 'dev';
    clientSecret = 'dev';
    uuid = 'dev';
    apiURL = 'http://localhost:3001/api-v1';
    currentWeb = 'http://localhost:3003';
    kakaoID = process.env.KAKAO_ID;
    googleID = process.env.GOOGLE_clientID;
    googleClient = process.env.GOOGLE_ClientSecret;
}

module.exports = {
    production, port, cookieSecret, jwtSecret, clientSecret, uuid, apiURL, currentWeb,kakaoID,googleID,googleClient
};
