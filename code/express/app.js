const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require("body-parser");
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const userRounter = require('./routes/user');
const session = require("express-session");
const uuid = require("uuid/v4");
const flash = require("connect-flash");
const passport = require("./config/passport");
const expressValidator = require("express-validator");


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(flash());
app.use(bodyParser.json());
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

app.use("/public",express.static(path.join(__dirname, 'public')));


app.all("/user", auth);
app.all("/admin", auth);

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use("/user", userRounter)
app.use('/admin', adminRouter);


app.post("/users/login", function(req, res, next) {
  passport.authenticate("local.login", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({ success: false, message: "authentication failed" });
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      if (req.body.referer && (req.body.referer !== undefined && req.body.referer.slice(-6) !== "/login")) {
        res.redirect(req.body.referer);
      } else {
        res.redirect("/");
      }
    });
  })(req, res, next);
});


app.get("/users/logout", function(req, res) {
  req.logout();
  res.redirect('/');
});

app.post("/users/register", function(req, res, next) {
  passport.authenticate("local.register", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(info);
    }
    return res.redirect("/users/login");
  })(req, res, next);
});



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
