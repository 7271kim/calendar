const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const devConfig = require('../devConfig');
const router = express.Router();
const {request} = require('./api')


router.get('/kakao', isNotLoggedIn, passport.authenticate('kakao'));
router.get('/google', isNotLoggedIn, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/kakao/callback', isNotLoggedIn, passport.authenticate('kakao', {
  failureRedirect: '/',
}), login);

router.get('/google/callback', isNotLoggedIn, passport.authenticate('google', {
  failureRedirect: '/',
}), login);

router.get('/logout', isLoggedIn, async (req, res, next) => {
  if( req.session.loginType === 'kakao' ){
    try {
        axios.get(`https://kauth.kakao.com/oauth/logout?client_id=${devConfig.kakaoID}&logout_redirect_uri=${devConfig.currentWeb}/`);
        axios.defaults.headers.Authorization = `Bearer ${req.session.accessToken}`
        axios.post(`https://kapi.kakao.com/v1/user/logout`);
    } catch (error) {
      console.log(error);
    }
    
  }
  req.logout();
  req.session.destroy();
  res.redirect('/');
});


async function login( req, res, next ){
  try {
    if( req.user && req.user.email ) {
        req.session.email = req.user.email;
        req.session.name  = req.user.name;
        req.session.accessToken  = req.user.accessToken;
        req.session.loginType  = req.user.loginType;
        
        const result = await request(
          req, `/member/${req.session.email}`,
        );
        if( result.data.list == 0 ){
          req.method = 'POST';
          const result = await request(
            req, `/member/`,
          );
          if( !result.data.status ) {
            new Error(result.data.message);
          }
        }
        
        res.redirect('/');
        
      }
  } catch (error) {
    if (error.code || error.message ) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = router;
