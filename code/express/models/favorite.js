// 引入mongoose模块
const mongoose = require("mongoose");
// 引入收藏的schema
const favoriteSchema = require("../schemas/favorites");

// 创建收藏模型
module.exports = mongoose.model("favorite", favoriteSchema);
