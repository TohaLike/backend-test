const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  availability: Boolean,
});

const Food = mongoose.model("Food", foodSchema, "food");
module.exports = Food;