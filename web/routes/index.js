const express = require('express');
const axios = require('axios');
const devConfig = require('../devConfig');

const router = express.Router();

router.get('/', async (req, res, next) => {
  res.render('main');
});

router.get('/cal', async (req, res, next) => {
  res.render('cal-resigst');
});


module.exports = router;
