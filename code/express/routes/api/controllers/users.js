const request = require('request');
const jwt = require('jsonwebtoken');
const config = require('../../../config/config');
const redis = require("../../../models/redis");
const WxBizDataCrypt = require('../../../utils/wxBizDataCrypt');
const mongoose = require('mongoose');
const userModel = mongoose.model("user");
const userinfoModel = mongoose.model("userinfo");

/**
 * 用户通过微信小程序进行注册／登陆
 * 根据微信小程序登陆的信息，获取对应user的openId和unionId，并创建对应的用户信息
 * @param req
 * @param res
 */


module.exports.authWithWeiXinApp = function (req, res) {
  const appId = config.wxAppId
  const appSecret = config.wxAppSecret
  const code = req.query.code
  let sessionKey = ''
  let openId = ''
  let requestOptions, path
  path = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
  requestOptions = {
    url: path,
    method: 'GET',
    json: {}
  }
  request(
    requestOptions,
    function (err, response, body) {
      if (err) {
        return res.tools.setJson(400, 1, err)
      }
      if (body.errcode === undefined) {
        sessionKey = body.session_key;
        openId = body.openId;
        userModel.findOne({"weiXin.openId":openId}, function (err, user) {
          if (err) {
            return res.tools.setJson(400, 1, err)
          }
          if (!user) {
            res.tools.setJson(400, 1, "该微信没有注册用户！")
          } else {
            const token = jwt.sign(user.toJSON(), config.secret, {
              expiresIn: 60 * 60 * 48 // expires in 48 hours
            })
            redis.redisClient.set(openId,sessionKey); // 保存信息
            redis.redisClient.expire(token, 60 * 60 * 1.5);
            return res.tools.setJson(200, 0, 'success', {
              token: 'JWT ' + token,
              user: user
            })
          }
        })
      } else {
        return res.tools.setJson(400, 1, body.errmsg)
      }
    }
  )
}


/**
 * 以下是微信加密数据解码实例代码
 */
module.exports.authWithWeiXinApp2= function (req, res) {
  const appId = config.wxAppId
  const appSecret = config.wxAppSecret
  const code = req.query.code
  let sessionKey = ''
  let requestOptions, path
  path = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
  requestOptions = {
    url: path,
    method: 'GET',
    json: {}
  }
  request(
    requestOptions,
    function (err, response, body) {
      if (err) {
        return res.tools.setJson(400, 1, err)
      }
      if (body.errcode === undefined) {
        sessionKey = body.session_key;
        userModel.findOne(query, function (err, user) {
          if (err) {
            return res.tools.setJson(400, 1, err)
          }
          if (!user) {
            let newUser = new userModel({
              avatarUrl: data.avatarUrl,
              name: data.nickName,
              weiXin: {
                appId: config.wxAppId,
                openId: data.openId,
                unionId: data.unionId,
                nickName: data.nickName,
                gender: data.gender,
                city: data.city,
                province: data.province,
                country: data.country,
                avatarUrl: data.avatarUrl
              }
            });
            newUser.save(function (err, savedUser) {
              if (err) {
                return res.tools.setJson(400, 1, err)
              }
              const token = jwt.sign(savedUser, config.secret, {
                expiresIn: 60 * 60 * 48 // expires in 48 hours
              })
              redis.redisClient.set(token, { openId: openId, sessionKey: sessionKey });// 保存信息
              redis.redisClient.expire(token, 60 * 60 * 1.5);
              return res.tools.setJson(201, 0, 'success', {
                token: 'JWT ' + token,
                user: savedUser
              })
            })
          } else {
            const token = jwt.sign(user, config.secret, {
              expiresIn: 60 * 60 * 48 // expires in 48 hours
            })
            redis.redisClient.set(token, { openId: openId, sessionKey: sessionKey }); // 保存信息
            redis.redisClient.expire(token, 60 * 60 * 1.5);
            return res.tools.setJson(200, 0, 'success', {
              token: 'JWT ' + token,
              user: user
            })
          }
        })
      } else {
        return res.tools.setJson(400, 1, body.errmsg)
      }
    }
  )
}

module.exports.userUpdateName = function (req, res) {
  if (req.user) {
    let name = req.body.name;
    if(name == req.user.username){
      return res.tools.setJson(400, 1, "用户名未修改！")
    }
  req
    .checkBody("name", "输入无效用户名,用户名至少为6位")
    .notEmpty()
    .isLength({ min: 6 });

  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function (error) {
      messages.push(error.msg);
    });
    return res.tools.setJson(400, 2, messages);
  }
    userModel.findOne({username:name}, (err, user)=>{
      if(err){
        res.tools.setJson(200, 1, err)
      }
      if(user){
        res.tools.setJson(200, 2, "该用户名已经被占用！")
      }
      else{
        userModel.findById(req.user._id, config.filter,
          (err, user) => {
            user.username = name
            user.save(function (err, user) {
              if (err) {
                return res.tools.setJson(400, 1, err)
              } else {
                return res.tools.setJson(200, 0, 'sucess', {
                  user: user
                })
              }
            })
          })
      }
    })
  } else {
    return res.tools.setJson(404, 1, "用户没有登录！")
  }
}

module.exports.userUpdateTel = function (req, res) {
  if (req.user) {
    let tel = req.body.tel;
    if(tel == req.user.tel){
      return res.tools.setJson(400, 1, "手机号未修改！")
    }
    req.checkBody(
      "tel",
      "输入无效手机号码,手机号码为中国大陆手机号码！")
      .isMobilePhone("zh-CN");
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userModel.findById(req.user._id, config.filter,(err, user)=>{
      user.tel = req.body.tel;
      user.save(function (err, user) {
        if (err) {
          return res.tools.setJson(400, 1, err);
        } else {
          return res.tools.setJson(200, 0, "success", { user: user });
        }
      });
    });
  } else {
    return res.tools.setJson(404, 1, "no user")
  }
}

module.exports.userUpdateEmail = function (req, res) {
  if (req.user) {
    let email = req.body.email;
    if(email == req.user.email){
      return res.tools.setJson(400, 1, "邮箱未修改！")
    }

    req.
    checkBody(
      'email', '输入无效email,email格式为example@example.com')
      .notEmpty()
      .isEmail();
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function (error) {
          messages.push(error.msg);
        });
        return res.tools.setJson(400, 2, messages);
      }
    userModel.findById(req.user._id,config.filter,(err, user)=> {
      user.email = email;
      user.save(function (err, user) {
        if (err) {
          return res.tools.setJson(400, 1, err);
        } else {
          return res.tools.setJson(200, 0, "success", { user: user });
        }
      });
    });
  } else {
    return res.tools.setJson(404, 1, "no user")
  }
}

module.exports.userUpdatePassword = function(req, res) {
  if (req.user) {
    let password = req.body.password;
    if(password == req.user.password){
      return res.tools.setJson(400, 1, "密码未修改！")
    }
    req
    .checkBody("password", "输入无效密码,密码至少为6位")
    .notEmpty()
    .isLength({ min: 6 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userModel.findById(req.user._id, config.filter, (err, user) =>{
      const tmp = user.toJSON();
      user.password = password;
      user.setPassword(password);
      user.save(function(err, newuser) {
        if (err) {
          return res.tools.setJson(400, 1, err);
        } else {
          return res.tools.setJson(200, 0, "success", { 'user': tmp });
        }
      });
    });
  } else {
    return res.tools.setJson(404, 1, "no user");
  }
};

module.exports.userUpdateSchool = function (req, res) {
  if (req.user) {
    let school = req.body.school;
    if(school == req.user.userInfo.school){
      return res.tools.setJson(400, 1, "学校未修改！")
    }
    // 需要验证school的正确性
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userinfoModel.findOne({userId:req.user._id},config.filter,(err, user)=> {
      user.school = school;
      user.save(function(err, user) {
        if (err) {
          return res.tools.setJson(400, 1, err);
        } else {
          return res.tools.setJson(200, 0, "success", { user: user });
        }
      });
    });
  } else {
    return res.tools.setJson(404, 1, "no user");
  }
};

module.exports.userUpdateDepartment = function (req, res) {
  if (req.user) {
    let department = req.body.department;
    if(department == req.user.userInfo.department){
      return res.tools.setJson(400, 1, "院系未修改！")
    }
    // TODO 需要验证department的正确性
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userinfoModel.findOne({ userId: req.user._id },config.filter,(err, user)=> {
      user.department = department;
      user.save(function (err, user) {
        if (err) {
          return res.tools.setJson(400, 1, err);
        } else {
          return res.tools.setJson(200, 0, "success", { user: user });
        }
      });
    });
  } else {
    return res.tools.setJson(404, 1, "no user");
  }
};