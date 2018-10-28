// 引入相关模块
const mongoose = require("mongoose");

/*
    文章分类的数据结构
    {
        文章标题，字符串类型
    }
*/
module.exports = new mongoose.Schema({
  name: String
});
