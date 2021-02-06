const fs = require('fs');
const path = require('path');
const watcher = require('./less-js-watcher');
const livereload = require('livereload');
const livereloadMiddleware = require('connect-livereload');
const exec = require('child_process').exec;

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');

const devConfig = require('./devConfig');

const passport = require('passport');
const passportConfig = require('./passport');

passportConfig();

const env = devConfig.production;
const app = express();



const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const {apiRouter} = require('./routes/api');


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

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname,'static')));

if( env === 'dev' ){
    const liveServer = livereload.createServer({
      exts:['html','css','js','less'],
      debug:true
    });
  
    liveServer.watch(__dirname);
    watcher(env);
  
    app.use(morgan('dev'));
    app.use(livereloadMiddleware());
}

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = env === 'dev' ? err : {};
  res.status(err.status || 500);
  console.log(err);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
  