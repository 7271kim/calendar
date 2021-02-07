const devConfig = require('../devConfig');
const passport = require('passport');
const kakao = require('./kakaoStrategy');
const google = require('./GoogleStrategy');

module.exports = () => {
  passport.serializeUser((profile, done) => {
    done(null, profile);
  });

  passport.deserializeUser((profile,  done) => {
    done(null, profile);
  });

  kakao();
  google();

};
