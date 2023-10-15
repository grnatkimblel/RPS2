const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 8200;
const app = express();
const server = http.createServer(app);
const db = require("./models");

app.use(express.json());
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//Routers
const gameControllerRouter = require("./routes/Game_Controller");

app.use("/game", gameControllerRouter);
io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.id} disconnected`);
  });
});

io.on("new_namespace", (namespace) => {
  console.log(namespace.name);
});

db.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});
