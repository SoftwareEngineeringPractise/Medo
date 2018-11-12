var mongoose = require("mongoose");
var userspaceSchema = require("../schemas/userspaces.js");

// 用户空间的模型对象
module.exports = mongoose.model("userspace", userspaceSchema);