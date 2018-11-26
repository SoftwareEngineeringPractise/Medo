const mongoose = require("mongoose");
/*
    用户的数据结构
    {
        用户名，字符串
        密码，字符串
        邮箱，字符串
        手机，字符串
        头像URL，字符串
        hash/salt 字符串
        是否为管理员，布尔值
        角色，限定字符串
        角色是否认证，布尔值，
        邮箱/手机号是否认证，布尔值，
        微信，引用对象，
        用户评价，数组

    }
*/
const weiXinSchema = new mongoose.Schema({
  appId: String,
  openId: String,
  unionId: { type: String, default: '' },
  nickName: String,
  gender: String,
  city: String,
  province: String,
  country: String,
  avatarUrl: String
})


module.exports = new mongoose.Schema({
  username: { type: String, default: "" },
  password: { type: String, default: "" },
  email: { type: String, default: "" },
  avatarUrl: {type: String, default: ""},
  tel: { type: String, default: "" },
  hash: String,
  salt: String, // 加盐验证
  isadmin: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["Visitor", "Student", "Mentor", "Lab"],
    default: "Visitor"
  },  //身份认证角色，未认证者为Visitor
  verified:{type:Boolean, default: false}, //是否经过身份认证
  status: { type: String, default: "0" }, // 0 - 未激活（不能使用tel／email + password进行登录；1 - 正常；2 - 禁用
  weiXin: { type:weiXinSchema, default: null},
  comment:{ type: Array, default:[]} 
});;