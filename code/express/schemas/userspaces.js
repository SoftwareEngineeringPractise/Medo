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
  gender: {
    type: String,
    enum: ["male", "female", "undefined"],
    default: "undefined"
  },
  // 格言
  motto: {
    type: String,
    default: "Life is tough"
  },
  // 真实名称
  realname: {
    type: String,
    default: ""
  },
  // 描述
  description: {
    type: String,
    default: ""
  },
  // 学校
  school: {
    type: String,
    default: undefined
  },
  // 院系
  department: {
    type: String,
    default: undefined
  },
  // 研究所
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: undefined
  },
  // 加入收藏的人或实验室
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: undefined
  },
  // 保存当前需要处理的信息
  messages: {
    type: [String],
    default: undefined
  }
});
