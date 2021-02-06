const devConfig = require('../devConfig');
const passport = require('passport');
const kakao = require('./kakaoStrategy');

module.exports = () => {
  passport.serializeUser((profile, done) => {
    done(null, profile);
  });

  passport.deserializeUser((profile,  done) => {
    done(null, profile);
  });

  kakao();

};
