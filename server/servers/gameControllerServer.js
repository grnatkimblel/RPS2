const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const socket = require("../gameSocket");
const express = require("express");
const cors = require("cors");

const { createServer } = require("http");

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cors());
const io = socket(server);

//Routers
const { router: gameControllerRouter } = require("../routes/Game_Controller");

app.use("/api/game", gameControllerRouter);

module.exports = server;
