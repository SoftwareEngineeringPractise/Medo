const mongoose = require("mongoose");

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
  salt: String,
  isadmin: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["Visitor", "Student", "Mentor", "Lab"],
    default: "Visitor"
  },
  status: { type: String, default: "0" }, // 0 - 未激活（不能使用tel／email + password进行登录；1 - 正常；2 - 禁用
  weiXin: { type:weiXinSchema, default: null},
});;