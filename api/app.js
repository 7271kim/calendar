const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks = require('nunjucks');
const devConfig = require('./devConfig');
const { sequelize } = require('./models');
const version1 = require('./routes/version1.0.0');

const env = devConfig.production;
const app = express();

app.set('port', devConfig.port);
app.set('view engine', 'html');

nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })
    .then(() => {
      console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
      console.error(err);
    });

if( env === 'dev' ){
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(devConfig.cookieSecret));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: devConfig.cookieSecret,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use('/api-v1', version1);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = devConfig.production === 'dev' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
