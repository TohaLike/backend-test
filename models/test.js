const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  _id: Number,
  title: String,
});

const Test = mongoose.model("Test", testSchema, "test");
module.exports = Test;