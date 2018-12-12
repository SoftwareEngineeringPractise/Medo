// 引入mongoose模块
const mongoose = require("mongoose");
// 引入时间格式化模块
const moment = require("moment");
const utils = require("../utils/utils");

/*
    邮箱验证的数据结构
    {
        用户，引用对象
        验证code，引用对象
        创建时间，字符串
    }
*/

module.exports = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    code: {
        type: String,
        default: utils.randomWord(false, 16)
    },
    addTime: {
        type: String,
        default: moment().format("YYYY-MM-DD h:mm:ss a")
    }
});
