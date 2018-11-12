// 引入mongoose模块
const mongoose = require("mongoose");
// 引入时间格式化模块
const moment = require("moment");

/*
    文章内容的数据结构
    {
        标题，字符串类型
        分类id，引用对象
        作者，引用对象
        添加时间，字符串
        阅读量，字符串
        简介，字符串
        正文，字符串
    }
*/

module.exports = new mongoose.Schema({
  title: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category"
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  addTime: {
    type: String,
    default: moment().format("YYYY-MM-DD h:mm:ss a")
  },
  views: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    default: ""
  },
  comment: {
    type: Array,
    default: []
  }
});
