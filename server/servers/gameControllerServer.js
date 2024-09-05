// const jwt = require("jsonwebtoken");

const socket = require("../gameSocket");
const express = require("express");
const cors = require("cors");

const { createServer } = require("http");
// const { Server } = require("socket.io");
// const authenticateToken = require("../helper/authenticateToken");

const app = express();
const server = createServer(app);
// const server = createServer(app);
// const { instrument } = require("@socket.io/admin-ui");
// //io lives here Server side
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000", "https://admin.socket.io"],
//     credentials: true,
//   },
// });
// instrument(io, { auth: false, mode: "development" });
app.use(express.json());
app.use(cors());
io = socket(server);
//Socket Authentication Middleware
/*
 * the Socket instance is not actually connected when the middleware gets executed,
 * which means that no disconnect event or connect events will be emitted if the
 * connection eventually fail.
 */

// io.use((socket, next) => {
//   logger.info("");
//   logger.info("Socket Middleware running");
//   if (socket.handshake.auth.token) {
//     jwt.verify(
//       socket.handshake.auth.token,
//       process.env.ACCESS_TOKEN_SECRET,
//       (err, user) => {
//         if (err) next(new Error("Unauthorized"));
//         logger.info("Socket Authentication Successful");
//         logger.info("socket auth user");
//         logger.info(user);
//         logger.info("End of Middleware");
//         logger.info("");
//         socket.client_id = user.id; //this is an arbitrarily added field to attach client details to the socket instance
//         socket.authUser = user;
//         next();
//       }
//     );
//   } else {
//     next(new Error("no auth token"));
//   }
// });

// //Socket.io Handlers
// const { registerGameControllerHandlers } = require("../routes/Game_Controller");

//Routers
const { router: gameControllerRouter } = require("../routes/Game_Controller");

app.use("/api/game", gameControllerRouter);

/*

*/
// io.on("connection", (socket) => {
//   logger.info(`User ${socket.id} connected`);
//   registerGameControllerHandlers(io, socket);

//   socket.on("disconnect", (reason) => {
//     logger.info(`User ${socket.authUser.username} disconnected`);
//   });
// });

// io.on("new_namespace", (namespace) => {
//   logger.info(namespace.name);
// });

// io.of("/").adapter.on("create-room", (room) => {
//   //logger.info(`room ${room} was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//   //logger.info(`socket ${id} has joined room ${room}`);
// });

module.exports = app;
