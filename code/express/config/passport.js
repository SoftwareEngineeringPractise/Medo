const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const userModel = mongoose.model('user');


passport.use("local.login",new LocalStrategy({
}, (username, password, done) => {
    userModel
        .findOne({ username })
      .then(user => {
        if (!user || !user.validatePassword(password)) {
          return done(null, false, {
            errors: { "email or password": "is invalid" }
          });
        }
        return done(null, user);
      })
      .catch(done);
}));

passport.use(
  "local.register",
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true //此处为true，下面函数的参数才能有req
    },
    function (req, username, password, done) {
      // req.checkBody('email', '您输入的email无效').notEmpty().isEmail();
      req
        .checkBody("password", "您输入了无效密码")
        .notEmpty()
        .isLength({ min: 4 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function (error) {
          messages.push(error.msg);
        });
        return done(null, false, req.flash("error", messages));
      }
      userModel.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: "此用户名已经被注册" });
        }
        var newUser = new userModel();
        newUser.username = username;
        // newUser.password = newUser.encryptPassword(password);
        newUser.password = password;
        newUser.save(function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    userModel.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;