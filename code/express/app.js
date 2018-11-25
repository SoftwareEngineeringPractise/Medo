const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require("body-parser");
const session = require("express-session");
const uuid = require("uuid/v4");
const flash = require("connect-flash");
const expressValidator = require("express-validator");
const cors = require('cors');
require("./models/db");
const passport = require('./config/passport');
const tools = require("./middlewares/tools");



// Web 路由
const indexRouter = require('./routes/index');
const adminRouter = require("./routes/admin");
const webapiRouter = require("./routes/api/web");
const userRounter = require('./routes/user');

// 微信API路由
const wxapiRouter = require("./routes/api/wx");



const app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.use(logger('dev'));
app.use(expressValidator());
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());




app.use(
  session({
    genid: req => {
      return uuid();
    },
    secret: "haski",
    cookie: {
      maxAge: 500 * 1000,
    },
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use("/public", express.static(path.join(__dirname, "public")));


app.all("/user", auth);
app.all("/admin", auth);

app.use('/', indexRouter);
app.use("/user", userRounter)
app.use('/admin', adminRouter);

app.use("/api/", tools);
app.use("/api/web", webapiRouter);
app.use("/api/wx", wxapiRouter);


function auth(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
