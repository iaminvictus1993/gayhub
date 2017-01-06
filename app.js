var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
global.offerModel = require('./database/offerModel');
mongoose.connect("mongodb://localhost/gayhub");
var routes = require('./routes/index');
var users = require('./routes/users');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);   

io.on('connection', (socket	) => {
    console.log('a connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(obj){
        io.emit('message', {
            msg: obj.msg,
            name: obj.name
        });
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//设置跨域
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    next();
});
app.use(session({
	secret: 'rianran1993',
    name: 'sessionCookie',
	cookie: {maxAge: 1000*60*60},
	resave: false, //是指每次请求都重新设置session cookie，假设你的cookie是10分钟过期，每次请求都会再设置10分钟
	saveUninitialized: true, //是指无论有没有session cookie，每次请求都设置个session cookie ，默认给个标示为 connect.sid
	store: new RedisStore({
		host: '127.0.0.1',
		port: 6379
	})
}));
app.use(flash());
app.use(function(req, res, next) {
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
});
// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));
app.use('/', routes);
//app.use('/users', users);

// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if(err.status === 404) {
        res.render('404',{message: err.message});
        return;
    }
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if(err.status === 404) {
      res.render('404',{message: err.message});
      return;
  } 
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.listen(3000);

module.exports = app;
