const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const devConfig = require('../devConfig');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: devConfig.kakaoID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    const email = 'kakao_'+profile._json.kakao_account.email;
    const name = profile.username;
    const loginType = 'kakao';

    done(null, {email,name,accessToken,loginType})
  }));
};
