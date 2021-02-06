const path = require('path');
const express = require('express');
const axios = require('axios');
const devConfig = require('../devConfig');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.get('/', async (req, res, next) => {
  res.sendFile( path.join(__dirname,'../views/main.html') );
});

router.get('/login', async (req, res, next) => {
  res.sendFile( path.join(__dirname,'../views/login.html') );
});


module.exports = router;
