// 引入mongoose模块
const mongoose = require("mongoose");
// 引入时间格式化模块
const moment = require("moment");

/*
    关注的数据结构
    {
        关注者id，引用对象
        被关注者id，引用对象
        关注创建的时间，字符串
    }
*/

module.exports = new mongoose.Schema({
    title: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    followId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    addTime: {
        type: String,
        default: moment().format("YYYY-MM-DD h:mm:ss a")
    },
});
