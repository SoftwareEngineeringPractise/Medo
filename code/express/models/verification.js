// 引入mongoose模块
const mongoose = require("mongoose");
// 引入用户信息的schema
const verificationSchema = require("../schemas/verifications");

// 创建用户信息模型
module.exports = mongoose.model("verification", verificationSchema);