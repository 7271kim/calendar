const fs = require('fs');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const watcher = require('./less-watcher');
const livereload = require('livereload');
const livereloadMiddleware = require('connect-livereload');

const liveServer = livereload.createServer({
    exts:['html','css','js','less'],
    debug:true
});

liveServer.watch(__dirname);

dotenv.config();

const productionConfig = process.env.PRODUCTION || 'dev';

watcher(productionConfig);
const app = express();

app.set('port', process.env.PORT || 8001 );

app.use(morgan( productionConfig ));
app.use(express.static(path.join(__dirname,'static')));
app.use(livereloadMiddleware());

app.get('/', ( req, res, next )=>{
    res.sendFile( path.join(__dirname,'./view/main.html') );
})

app.get('/login', ( req, res, next )=>{
    res.sendFile( path.join(__dirname,'./view/login.html') );
})


app.use(( req, res, next )=>{
    const err = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    err.status=404;
    next(err);
})

app.listen( app.get('port'), ()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
} )