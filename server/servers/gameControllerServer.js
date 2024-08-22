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
//io lives here Server side
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    credentials: true,
  },
});
instrument(io, { auth: false, mode: "development" });
app.use(express.json());
app.use(cors());

//Socket Authentication Middleware
/*
 * the Socket instance is not actually connected when the middleware gets executed,
 * which means that no disconnect event or connect events will be emitted if the
 * connection eventually fail.
 */

io.use((socket, next) => {
  console.log("");
  console.log("Socket Middleware running");
  if (socket.handshake.auth.token) {
    jwt.verify(
      socket.handshake.auth.token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, user) => {
        if (err) next(new Error("Unauthorized"));
        console.log("Socket Authentication Successful");
        console.log("socket auth user");
        console.log(user);
        console.log("End of Middleware");
        console.log("");
        socket.client_id = user.id; //this is an arbitrarilly added field to attach client details to the socket instance
        socket.authUser = user;
        next();
      }
    );
  } else {
    next(new Error("no auth token"));
  }
});

//Socket.io Handlers
const { registerGameControllerHandlers } = require("../routes/Game_Controller");

//Routers
const { router: gameControllerRouter } = require("../routes/Game_Controller");

app.use("/api/game", gameControllerRouter);

/*

*/
io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  registerGameControllerHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.authUser.username} disconnected`);
  });
});

io.on("new_namespace", (namespace) => {
  console.log(namespace.name);
});

io.of("/").adapter.on("create-room", (room) => {
  //console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  //console.log(`socket ${id} has joined room ${room}`);
});

dbSyncParam = process.env.NODE_ENV == "test" ? {force: true} : {}
db.sequelize.sync(dbSyncParam).then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});
