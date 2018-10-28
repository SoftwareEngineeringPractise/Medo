// 引入相关模块
const mongoose = require("mongoose");
const contentSchema = require("../schemas/contents.js");

// 文章内容的模型对象
module.exports = mongoose.model("content", contentSchema);
