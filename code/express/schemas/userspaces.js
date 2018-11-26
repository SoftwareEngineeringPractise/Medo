// 引入mongoose模块
const mongoose = require("mongoose");
/*
    用户空间的数据结构
    {
        用户，引用对象
        性别，限定字符串
        个人简介，字符串
        学校，字符串
        院系，字符串
        研究所，引用对象，
        关注，引用对象，
        收藏，引用对象，
        消息，字符串数组

    }
*/
module.exports = new mongoose.Schema({
  // 用户
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  // 性别
  gender: {
    type: String,
    enum: ["male", "female", "undefined"],
    default: "undefined"
  },

  // 个人描述
  description: {
    type: String,
    default: ""
  },

  // 学校
  school: {
    type: String,
    default: ""
  },

  // 院系
  department: {
    type: String,
    default: ""
  },

  // 研究所
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null
  },

  // 加入关注的用户
  follows: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "follow",
    default: null
  },
  // 加入收藏的文章

  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "favorite",
    default: null
  },
  // 信息处理
  messages: {
    type: Array,
    default: []
  }
});
