const express = require('express');
const jwt = require('jsonwebtoken');
const devConfig = require('../devConfig');
const { Member, CalList } = require('../models');
const { verifyToken, deprecated, apiLimiter } = require('./middlewares');
const router = express.Router();

// jwt 토근 발급
router.post('/token', async (req, res) => {
  const { clientSecret, mail, name } = req.body;
  try {
    // 추후 발급자 마다 해당 비밀키를 다르게 두어, DB세팅 후 거기서 확인 가능.
    if ( clientSecret !== devConfig.clientSecret ) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 키입니다.',
      });
    }

    const token = jwt.sign({
      mail, name
    }, devConfig.jwtSecret, {
      expiresIn: '10m', // 10분
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
      error : error
    });
  }
});

router.post('/member', verifyToken, apiLimiter, async (req, res ) => {
  const mail = req.decoded.mail;
  const name = req.decoded.name;

  try {
    Member.create({
      mail: mail,
      name : name
    })
    return res.json({
      status : true,
      message: 'Member 등록이 완료되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status : false,
      message: '서버 에러',
      error : error
    });
  }
});

router.post('/calendar', verifyToken, apiLimiter, async (req, res ) => {
  const mail = req.decoded.mail;

  try {
    CalList.create({
      title: req.body.title,
      content : req.body.content,
      important : req.body.important,
      startDate : req.body.startDate,
      endDate : req.body.endDate,
      mail : mail
    })
    return res.json({
      status : true,
      message: 'Calendar 등록이 완료되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      status : false,
      code: 500,
      message: '서버 에러',
      error : error
    });
  }
});

router.put('/calendar', verifyToken, apiLimiter, async (req, res ) => {
  const mail = req.decoded.mail;
  try {
    const result = await CalList.update({
      title: req.body.title,
      content : req.body.content,
      important : req.body.important,
      startDate : req.body.startDate,
      endDate : req.body.endDate
     }, {
      where : {
        seq: req.body.seq,
        mail: mail
      }
     })

    res.json({
      status : true,
      message: 'Calendar 등록이 완료되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      status : false,
      code: 500,
      message: '서버 에러',
      error : error
    });
  }
});

router.get('/calendar/:mail', verifyToken, apiLimiter, (req, res) => {
  const mail = req.decoded.mail;
  const input = req.params.mail;
  if( mail !== input ){
    return res.json({
      code: 200,
      status : false,
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
        status : false,
        message: '서버 에러',
        error : error
      });
    });
  }
});

router.delete('/calendar/:seq', verifyToken, apiLimiter, async (req, res) => {
  const mail = req.decoded.mail;
  const seq = req.params.seq;
  try {
    if( seq && mail ){
    
      const result = await CalList.destroy({where : { seq: seq, mail : mail }})
      console.log(result);
      return res.json({
        code: 200,
        status : true,
        message: '삭제 되었습니다.'
      });
    } else {
      return res.json({
        code: 200,
        status : false,
        message: '권한이 없습니다.'
      });
    }
  } catch (error) {
    return res.json({
      code: 200,
      status : false,
      message: '권한이 없습니다.'
    });
  }
  
});

router.get('/member/:mail', verifyToken, apiLimiter, (req, res) => {
  const mail = req.decoded.mail;
  const input = req.params.mail;
  if( mail !== input ){
    return res.json({
      code: 200,
      status : false,
      message: '권한이 없습니다.',
    });
  } else {
    Member.findAll({ 
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
        status : false,
        message: '서버 에러',
        error : error
      });
    });
  }
});

module.exports = router;
