// 引入mongoose模块
const mongoose = require("mongoose");
// 引入用户
var userSchema = require("./users.js");
/*
    用户空间的数据结构
    {
        用户名，引用对象
        性别，限定字符串
        真实姓名：字符串
        个性签名，字符串类型
        个人简介，字符串
        关注的人，用户id列表
    }
*/
module.exports = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  gender : {
      type: String,
      enum:["male", "female", "undefined"],
      default: "undefined"
  },
  motto: {
    type: String,
    default: "Life is tough"
  },
  realname : {
      type:String,
      default: ""
  },
  description: {
    type: String,
    default: ""
  },
  likes: {
    type: [userSchema],
    default: undefined
  },
});
