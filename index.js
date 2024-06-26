const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/chat", (req, res) => {
  try {
    res.status(200).json("OK");
  } catch (e) {
    res.status(500).json({ message: "Error", e: e.message });
  }
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
    io.to(room).emit("users", connectedUsers);
  });

  // Подключённые пользователи
  console.log("Total connected users:", connectedUsers);

  // Отключенные пользователи
  socket.on("disconnect", () => {
    connectedUsers--;
    console.log("user disconnected");
    io.except("some room").emit("hello", connectedUsers);
  });

  // Транслировать событие пользователям в комнате

  // Транслировать событие пользователям вне комнаты
  // io.except("some room").emit("hello", connectedUsers);

  // Сообщение чата
  // socket.on("chat message", (msg) => {
  //   console.log("message: " + msg);
  //   io.to("room1").emit("chat message", msg);
  // });

  socket.leave("some room");
});

server.on("error", (error) => {
  console.error("Socket.IO error:", error);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
