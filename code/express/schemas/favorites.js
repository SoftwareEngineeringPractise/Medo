// 引入mongoose模块
const mongoose = require("mongoose");
// 引入时间格式化模块
const moment = require("moment");

/*
    收藏的数据结构
    {
        收藏者id，引用对象
        收藏文章id，引用对象
        收藏创建的时间，字符串
    }
*/

module.exports = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "content"
  },
  addTime: {
    type: String,
    default: moment().format("YYYY-MM-DD h:mm:ss a")
  }
});
