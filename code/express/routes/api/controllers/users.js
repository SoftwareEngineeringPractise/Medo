const request = require('request')
const jwt = require('jsonwebtoken')
const config = require('../../../config/config')
const redis = require("../../../models/redis")
const WxBizDataCrypt = require('../../../utils/wxBizDataCrypt')
const mongoose = require('mongoose')
const userModel = mongoose.model("user");

/**
 * 用户通过微信小程序进行注册／登陆
 * 根据微信小程序登陆的信息，获取对应user的openId和unionId，并创建对应的用户信息
 * @param req
 * @param res
 */
module.exports.authWithWeiXinApp = function (req, res) {
  const appId = config.wxAppId
  const appSecret = config.wxAppSecret
  const encryptedData = req.body.encryptedData
  const code = req.body.code
  const iv = req.body.iv
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
        sessionKey = body.session_key
        const pc = new WxBizDataCrypt(appId, sessionKey)
        const data = pc.decryptData(encryptedData, iv)
        let query = {}
        if (data.unionId) {
          query = {
            'weiXin.unionId': data.unionId
          }
        } else if (data.openId) {
          query = {
            'weiXin.appId': config.wxAppId,
            'weiXin.openId': data.openId
          }
        }
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
    userModel.findById(req.user._id)
      .exec(function (err, user) {
        user.name = req.body.name
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
  } else {
    return res.tools.setJson(404, 1, "no user")
  }
}

module.exports.userUpdateTel = function (req, res) {
  if (req.user) {
    userModel.findById(req.user._id).exec(function (err, user) {
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
    userModel.findById(req.user._id).exec(function (err, user) {
      user.email = req.body.email;
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
    userModel.findById(req.user._id).exec(function(err, user) {
      user.email = req.body.email;
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