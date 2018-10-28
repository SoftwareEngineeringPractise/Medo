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
const FileStore = require("session-file-store")(session);
const app = express();
const passport = require("./config/passport");
const expressValidator = require("express-validator");
const pagination = require("./modules/pagination");
const categoryModel = require("./models/category");
const contentModel = require("./models/content");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: "cat",
    cookie: {
      maxAge: 60 * 1000
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



app.get("/users/login", (req, res) => {
  console.log(req.other);
  res.render("users/login", {other:req.other});
});

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
      return res.redirect("/user?name=" + req.user.username);
    });
  })(req, res, next);
});

app.get("/users/logout", function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get("/users/register", (req, res) => {
  console.log(req.other);
  res.render("users/register", { other: req.other });
});


app.post("/users/register", function(req, res, next) {
  passport.authenticate("local.register", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({ success: false, message: "用户名已经注册" });
    }
    return res.redirect("/users/login");
  })(req, res, next);
});



function auth(req, res, next) {
  if (req.isAuthenticated()){
    console.log("Happy");
    return next();
  }
  res.redirect('/');
}



app.use(
  session({
    genid: req => {
      console.log(req.sessionID);
      return uuid();
    },
    store: new FileStore(),
    secret: "haski",
    resave: false,
    saveUninitialized: true
  })
);


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
