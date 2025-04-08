// import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
// import authenticateToken from "./helper/authenticateToken.js";
import logger from "./utils/logger.js";
import secrets from "./helper/secrets.js";

//Socket.io Handlers
import { registerGameControllerHandlers as QuickdrawGameControllerHandlers } from "./routes/Quickdraw_Game_Controller.js";
import { registerGameControllerHandlers as TDMGameControllerHandlers } from "./routes/TDM_Game_Controller.js";
import { instrument } from "@socket.io/admin-ui";
// import { Socket } from "dgram";

//te

export default (server) => {
  //io lives here Server side
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", process.env.VITE_HOST_URL, "https://admin.socket.io"],
      credentials: true,
      optionsSuccessStatus: 200,
    },
  });
  instrument(io, { auth: false, mode: "development" });

  io.use((socket, next) => {
    logger.info("");
    logger.info("Socket Middleware running");
    if (socket.handshake.auth.token) {
      jwt.verify(socket.handshake.auth.token, secrets.jwtAccessTokenSecret, (err, user) => {
        if (err) next(new Error("Unauthorized"));
        logger.info("Socket Authentication Successful");
        logger.info("socket auth user");
        logger.info(user);
        logger.info("End of Middleware");
        logger.info("");
        socket.client_id = user.id; //this is an arbitrarily added field to attach client details to the socket instance
        socket.authUser = user;
        next();
      });
    } else {
      next(new Error("no auth token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket: User ${socket.id} connected`);
    QuickdrawGameControllerHandlers(io, socket);
    TDMGameControllerHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      logger.info(`Socket: User ${socket.authUser.username} disconnected`);
    });
  });

  io.on("new_namespace", (namespace) => {
    logger.info(namespace.name);
  });

  io.of("/").adapter.on("create-room", (room) => {
    //logger.info(`room ${room} was created`);
  });

  io.of("/").adapter.on("join-room", (room, id) => {
    //logger.info(`socket ${id} has joined room ${room}`);
  });

  return io;
};
