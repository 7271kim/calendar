const express = require('express');
const jwt = require('jsonwebtoken');
const devConfig = require('../devConfig');
const { Member, CalList } = require('../models');

const { verifyToken, deprecated } = require('./middlewares');

const router = express.Router();

// jwt 토근 발급
router.post('/token', async (req, res) => {
  const { clientSecret, loginId } = req.body;
  try {
    
    if ( clientSecret !== devConfig.clientSecret ) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 키입니다.',
      });
    }

    const token = jwt.sign({
      uuid: devConfig.uuid,
      loginId : loginId
    }, process.env.JWT_SECRET, {
      expiresIn: '10m', // 1분
      issuer: 'calendar',
    });

    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

router.get('/calendar/:id', verifyToken, (req, res) => {
  const {seq} = req.body;
  const loginId = req.decoded.loginId;
  if( id !== loginId ){
    return res.json({
      code: 200,
      message: '권한이 없습니다.',
    });
  } else {
    CalList.findAll({ where: { seq: seq } })
    .then((posts) => {
      res.json({
        code: 200,
        list: posts,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    });
  }
});

module.exports = router;
