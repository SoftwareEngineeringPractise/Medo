// 引入mongoose模块
const mongoose = require("mongoose");
// 引入用户信息的schema
const userinfoSchema = require("../schemas/userinfos");

// 创建用户信息模型
module.exports = mongoose.model("userinfo", userinfoSchema);
