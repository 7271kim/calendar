const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');
const devConfig = require('./devConfig');
const env = devConfig.production;
const app = express();
const indexRouter = require('./routes');
const apiRouter = require('./routes/api');

app.set('port', devConfig.port);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(cookieParser(devConfig.cookieSecret));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: devConfig.cookieSecret,
  cookie: {
    httpOnly: true,
    secure: false,
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


if( env === 'dev' ){
    app.use(morgan('dev'));
}

app.use('/', indexRouter);
app.use('/api', apiRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });
  
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });
  
  app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
  });
  