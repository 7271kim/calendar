const path = require('path');
const express = require('express');
const axios = require('axios');
const devConfig = require('../devConfig');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
  res.sendFile( path.join(__dirname,'../views/main.html') );
});

router.get('/login', isNotLoggedIn, async (req, res, next) => {
  res.sendFile( path.join(__dirname,'../views/login.html') );
});

router.get('/logout', isLoggedIn, async (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
