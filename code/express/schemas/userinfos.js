const mongoose = require("mongoose");
module.exports = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  // 角色
  role: {
    type: String,
    enum: ["Visitor", "Student", "Mentor", "Lab"],
    default: "Visitor"
  }, //身份认证角色，未认证者为Visitor

  // 性别
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male"
  },

  // 个人描述
  description: {
    type: String,
    default: ""
  },

  // 学校
  school: {
    type: String,
    default: ""
  },

  // 院系
  department: {
    type: String,
    default: ""
  },

  // 研究所
  institute: {
    type: String,
    default: ""
  }
});