const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const devConfig = require('../devConfig');

module.exports = () => {
  passport.use(new GoogleStrategy({
    clientID: devConfig.googleID,
    clientSecret: devConfig.googleClient,
    callbackURL: `${devConfig.currentWeb}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
      const email = 'google_'+profile._json.email;
      const name = profile._json.name;
      const loginType = 'google';

      done(null, {email,name,accessToken,loginType})
  }));
};