const mongoose = require('mongoose');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userModel = mongoose.model('user');
const config = require('./config');

newUserSpaceModel = mongoose.model('userspace');


passport.use("local.login",new LocalStrategy({
}, (username, password, done) => {
    userModel
        .findOne({ username })
      .then(user => {
        if (!user || !user.validatePassword(password)) {
          return done(null, false,  "用户名或密码不正确");
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
      req.
        checkBody(
          'email', '输入无效email,email格式为example@example.com')
          .notEmpty()
          .isEmail();
      req.checkBody(
        "tel",
        "输入无效手机号码,手机号码为11位")
        .isMobilePhone("zh-CN");
      req
        .checkBody("password", "输入无效密码,密码至少为4位")
        .notEmpty()
        .isLength({ min: 4 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function (error) {
          messages.push(error.msg);
        });
        return done(null, false, messages);
      }
      userModel.findOne({ username: username }, function (err, user, info) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, "此用户名已经被注册" );
        }
        var newUser = new userModel();
        var newUserSpace = new newUserSpaceModel();
        newUser.username = username;
        newUser.password = password;
        newUser.setPassword(password)
        newUser.email = req.body.email;
        newUser.tel = req.body.tel;
        // newUser.userspace = newUserSpace;
        newUser.save(function (err, result) {
          if (err) {
            return done(err);
          }
         newUserSpace.user = result._id;
         newUserSpace.save(function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
          });
        });
      });
    }
  )
);

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = config.secret;
opts.passReqToCallback = true;

passport.use(
  "jwt",
  new JwtStrategy(opts, function(req, jwtPayload, done) {
    let token = req.header("Authorization");
    redis.redisClient.get(token, function(err, reply) {
      if (err) {
        return done(err, false, "Redis服务器访问失败！");
      }
      if (reply === null) {
        return done(err, false, "用户未登录或登录Session过期！请重新认证！");
      }
      if (jwtPayload) {
        userModel.findOne({ _id: jwtPayload._id }, function(err, user) {
          if (err) {
            return done(err, false);
          }
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
      return done(null, false, "没有用户登录！");
    });
  })
);

passport.use(
  "jwt.login",
  new JwtStrategy(opts, function (req, jwtPayload, done) {
    // let token = req.header("Authorization");
    let username = req.body.username;
    let password = req.body.password;
    userModel.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (!user || !user.validatePassword(password)) {
        return done(null, false, "用户名或密码不正确");
      }
      userModel.findByIdAndDelete(jwtPayload._id, (err, result) => {
        if (err) {
          return done(null, false, "未知原因错误！");
        }
        user._id = jwtPayload._id;
        user.weiXin = jwtPayload.weiXin;
        user.save();
      })
      return done(null, user);
    })
  })
);


passport.use(
  "jwt.register",
  new JwtStrategy(opts, function (req, jwtPayload, done) {
    if (!jwtPayload._id) {
      return done(null, false, "微信登录态失效！")
    }
    let username = req.body.username;
    let password = req.body.password;
    req.
      checkBody(
        'email', '输入无效email,email格式为example@example.com')
      .notEmpty()
      .isEmail();
    req.checkBody(
      "tel",
      "输入无效手机号码,手机号码为11位")
      .isMobilePhone("zh-CN");
    req
      .checkBody("password", "输入无效密码,密码至少为4位")
      .notEmpty()
      .isLength({ min: 4 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return done(null, false, messages);
    }
    userModel.findOne({ username: username }, function (err, user, info) {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, false, "此用户名已经被注册");
      }
      var newUser = new userModel();
      var newUserSpace = new newUserSpaceModel();
      newUser.username = username;
      newUser.password = password;
      newUser.setPassword(password)
      newUser.email = req.body.email;
      newUser.tel = req.body.tel;
      newUser.weiXin = jwtPayload.weiXin;
      // newUser.userspace = newUserSpace;
      newUser.save(function (err, result) {
        if (err) {
          return done(err);
        }
        newUserSpace.user = result._id;
        newUserSpace.save(function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    });
  })
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