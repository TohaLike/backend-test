const mongoose = require("mongoose");
const Test = require("./models/test.js");
const Food = require("./models/food.js");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

const PORT = 3001;

const app = express();

mongoose
  .connect("mongodb://localhost:27017/admin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.log("Could not to connect", err));

app.use(cors());
app.use(bodyParser.json());

app.get("/store", async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (err) {
    res.status(500).json({ message: "error", err: err.message });
  }
});

app.post("/store", async (req, res) => {
  try {
    const data = req.body;
    const newFood = new Food(data);
    await newFood.save();
    res.status(201).json("OK");
  } catch (err) {
    res.status(500).json({ message: "error", err: err.message });
  }
});

app.post("/store/delete", async (req, res) => {
  const { id } = req.body;
  try {
    const deleteFood = await Food.findByIdAndDelete(id);
    if (deleteFood) {
      res.status(200).json({ message: "Deleted OK" });
    } else {
      res.status(400).json({ message: "Food not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "error", err: err.message });
  }
});

app.post("/store/update", async (req, res) => {
  const { id, name } = req.body;
  try {
    const updateData = await Food.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (updateData) {
      res.status(200).json({ message: "Update" });
    } else {
      res.status(400).json({ message: "Not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "error", err: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
