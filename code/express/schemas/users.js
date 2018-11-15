var mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phonenumber: String,
  firstname: String,
  lastname: String,
  role: { 
    type: String,
    enum: ["Visitor","Student", "Mentor","Lab","Administrator" ],
    default: "Visitor"
  },
  hash: String,
  salt: String,
  isadmin: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
});;