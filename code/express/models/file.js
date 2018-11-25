/**
 * 文件
 */
// 引入mongoose模块
const mongoose = require("mongoose");
// 引入文章分类的schema
const fileSchema = require("../schemas/files");

// 注册文件模型
module.exports = mongoose.model("file", fileSchema);
