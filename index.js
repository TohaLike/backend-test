const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodypareser = require("body-parser");
const mongoose = require("mongoose");
const usersModel = require("./models/users");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const SECRET_KEY = crypto.randomBytes(64).toString("hex");

mongoose
  .connect("mongodb://localhost:27017/testchatjwt", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to the database"))
  .catch((err) => console.log("Could not to connect", err));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(bodypareser.json());

const user = { id: 1, username: "user", password: "password" };

app.post("/users", (req, res) => {
  const { username, password } = req.body;
  try {
    const token = jwt.sign({ id: user.id, username: username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (e) {
    res.status(401).json({ message: "invalid credentails" });
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("authentication error"));

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error("authentication error"));
    }
    console.log(token)
    socket.decoded = decoded;
    next();
  });
});

let connectedUsers = 0;

io.on("connection", (socket) => {
  // Добавление пользователя в онлайне
  connectedUsers++;

  // Сообщения
  socket.on("messages", (room, name, msg) => {
    socket.to(room).emit("messages", {
      name: name,
      message: msg,
    });

    socket.emit("messages", {
      name: name,
      message: msg,
    });

    console.log(room, name, msg, socket.id);
  });

  // Поделючение к компнате
  socket.on("join", (room) => {
    socket.join(room);
    io.to(room).emit("users", connectedUsers, "Ты в комнате");
  });

  // Подключённые пользователи
  console.log("Total connected users:", connectedUsers);

  // Отключенные пользователи
  socket.on("disconnect", () => {
    connectedUsers--;
    console.log("user disconnected");
    io.except("some room").emit("hello", connectedUsers);
  });
});

server.on("error", (error) => {
  console.error("Socket.IO error:", error);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
