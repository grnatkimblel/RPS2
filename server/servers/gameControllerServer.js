const db = require("../models");

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = 8200;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.json());
app.use(cors());

//Socket.io Handlers
const { registerGameControllerHandlers } = require("../routes/Game_Controller");

//Routers
const { router: gameControllerRouter } = require("../routes/Game_Controller");

app.use("/game", gameControllerRouter);

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  registerGameControllerHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.id} disconnected`);
  });
});

io.on("new_namespace", (namespace) => {
  console.log(namespace.name);
});

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});

db.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});
