// 引入mongoose模块
const mongoose = require("mongoose");
// 引入关注的schema
const followsSchema = require("../schemas/follows");

// 创建关注模型
module.exports = mongoose.model("follow", followsSchema);
