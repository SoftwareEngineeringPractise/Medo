var mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  hash: String,
  salt: String,
  isadmin: {
    type: Boolean,
    default: false
  }
});;