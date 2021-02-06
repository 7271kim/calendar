const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const devConfig = require('../devConfig');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: devConfig.kakaoID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile._json.kakao_account.email;
    const name = profile.username;

    done(null, {email,name})
  }));
};
