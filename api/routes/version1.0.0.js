const express = require('express');
const jwt = require('jsonwebtoken');
const devConfig = require('../devConfig');
const { Member, CalList } = require('../models');
const { verifyToken, deprecated } = require('./middlewares');
const router = express.Router();

// jwt 토근 발급
router.post('/token', async (req, res) => {
  const { clientSecret, mail } = req.body;
  try {
    
    if ( clientSecret !== devConfig.clientSecret ) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 키입니다.',
      });
    }

    const token = jwt.sign({
      uuid: devConfig.uuid,
      mail
    }, devConfig.jwtSecret, {
      expiresIn: '10m', // 1분
      issuer: 'calendar',
    });

    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

router.post('/member', verifyToken, async (req, res ) => {
  try {
    Member.create({
      mail: req.body.mail,
      name : req.body.name
    })
    return res.json({
      message: 'Member 등록이 완료되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

router.post('/calendar', verifyToken, async (req, res ) => {
  try {
    CalList.create({
      title: req.body.title,
      content : req.body.content,
      mail : req.body.mail
    })
    return res.json({
      message: 'Calendar 등록이 완료되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

router.get('/calendar/:mail', verifyToken, (req, res) => {
  const mail = req.decoded.mail;
  const input = encodeURIComponent(req.params.mail);
  if( mail !== input ){
    return res.json({
      code: 200,
      message: '권한이 없습니다.',
    });
  } else {
    CalList.findAll({ 
      include: [Member], 
      where: { 'mail': mail } })
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
