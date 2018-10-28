// 引入mongoose模块
const mongoose = require("mongoose");
// 引入文章分类的schema
const categoriesSchema = require("../schemas/categories");

// 创建文章分类模型
module.exports = mongoose.model("category", categoriesSchema);
