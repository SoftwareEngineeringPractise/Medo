// 引入mongoose模块
const mongoose = require("mongoose");
// 引入时间格式化模块
const moment = require("moment");


module.exports = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    role: String,
    school: String,
    department: String,
    institute: String,
    verifyUrl: String,
    addTime: {
        type: String,
        default: moment().format("YYYY-MM-DD h:mm:ss a")
    },
});
