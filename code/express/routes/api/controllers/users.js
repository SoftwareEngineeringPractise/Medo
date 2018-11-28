const request = require('request');
const jwt = require('jsonwebtoken');
const config = require('../../../config/config');
const redis = require("../../../models/redis");
const WxBizDataCrypt = require('../../../utils/wxBizDataCrypt');
const mongoose = require('mongoose');
const userModel = mongoose.model("user");
const userspaceModel = mongoose.model("userspace");

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
    let name = req.query.name;
    userModel.findOne({username:name}, (err, user)=>{
      if(err){
        res.tools.setJson(400, 1, err)
      }
      if(user){
        res.tools.setJson(400, 2, "该用户名已经被占用！")
      }
      else{
        userModel.findById(req.user._id,
          (err, user) => {
            user.name = req.query.name
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
    userModel.findById(req.user._id, (err, user)=>{
      console.log(req)
      user.tel = req.query.tel;
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
    userModel.findById(req.user._id,(err, user)=> {
      user.email = req.query.email;
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
    userModel.findById(req.user._id,(err, user) =>{
      user.password = req.query.password;
      user.setPassword(req.query.password);
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

module.exports.userUpdateSchool = function (req, res) {
  if (req.user) {
    userspaceModel.findOne({user:req.user._id},(err, user)=> {
      user.school = req.query.school;
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
    userspaceModel.findOne({ user: req.user._id },(err, user)=> {
      user.department = req.query.department;
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