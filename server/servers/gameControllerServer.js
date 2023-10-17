const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config", ".env") });

const jwt = require("jsonwebtoken");

const db = require("../models");

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authenticateToken = require("../helper/authenticateToken");

const PORT = 8200;
const app = express();
const server = createServer(app);
const { instrument } = require("@socket.io/admin-ui");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    credentials: true,
  },
});
instrument(io, { auth: false, mode: "development" });
app.use(express.json());
app.use(cors());

io.use((socket, next) => {
  if (socket.handshake.auth.token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) next(new Error("Unauthorized"));
      socket.authUser = user; //to set req for future functions
      next();
    });
  } else {
    next(new Error("no auth token"));
  }
});

//Socket.io Handlers
const { registerGameControllerHandlers } = require("../routes/Game_Controller");

//Routers
const { router: gameControllerRouter } = require("../routes/Game_Controller");

app.use("/game", gameControllerRouter);

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  console.log(`authUser ${socket.authUser}`);

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
