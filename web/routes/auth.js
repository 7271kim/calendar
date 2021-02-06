const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const devConfig = require('../devConfig');
const router = express.Router();


router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), async (req, res, next) => {
    try {
      if( req.user && req.user.email ) {
          req.session.email = req.user.email;
          req.session.name  = req.user.name;
          
          const result = await request(
            req, `/member/${mail}`,
          );
          
          console.log(result);
          res.redirect('/');
        }
    } catch (error) {
      if (error.code || error.message ) {
        console.error(error);
        next(error);
      }
    }
});

module.exports = router;
