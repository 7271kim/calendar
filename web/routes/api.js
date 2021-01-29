const express = require('express');
const axios = require('axios');
const devConfig = require('../devConfig');

const router = express.Router();
const URL = devConfig.apiURL;
const mail = 'aa';

axios.defaults.headers.origin = devConfig.currentWeb;
axios.defaults.timeout = 10000;

const request = async (req, api) => {
  try {
    if (!req.session.jwt) { // 세션에 토큰이 없으면
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: devConfig.clientSecret,
        mail : mail
      });
      req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
    }
    req.body.headers = { authorization: req.session.jwt };

    if(req.method === 'POST'){
      return await axios.post(`${URL}${api}`, req.body);
    } else {
      return await axios.get(`${URL}${api}`, {
        headers: { authorization: req.session.jwt }
      });
    }
  } catch (error) {
    if (error.response.status === 419) { // 토큰 만료시 토큰 재발급 받기
      delete req.session.jwt;
      return request(req, api);
    } // 419 외의 다른 에러면
    return error.response;
  }
};

router.get('/callist', async (req, res, next) => {
    try {
        const result = await request(
          req, `/calendar/${mail}`,
        );
        res.json(result.data);
      } catch (error) {
        if (error.code || error.message ) {
          console.error(error);
          next(error);
        }
      }
  });

router.post('/member-one', async ( req, res, next ) => {
    try {
      const result = await request(
        req, `/member`,
      );
      res.json(result.data);
    } catch (error) {
      if (error.code || error.message ) {
        console.error(error);
        next(error);
      }
    }
});

router.post('/cal-one', async ( req, res, next ) => {
  try {
    const result = await request(
      req, `/calendar`,
    );
    res.json(result.data);
  } catch (error) {
    if (error.code || error.message ) {
      console.error(error);
      next(error);
    }
  }
});
module.exports = router;
