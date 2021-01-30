const path = require('path');
const express = require('express');
const axios = require('axios');
const devConfig = require('../devConfig');

const router = express.Router();

router.get('/', async (req, res, next) => {
  res.sendFile( path.join(__dirname,'../views/main.html') );
});



module.exports = router;
