const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  id: Number,
  username: String,
  password: Number
});

const Users = mongoose.model("Users", testSchema, "users");
module.exports = Users;
