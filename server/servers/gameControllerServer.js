import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import socket from "../gameSocket.js";
import express from "express";
import cors from "cors";

import { createServer } from "http";

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cors());
const io = socket(server);

//Routers
import { router as QuickdrawGameControllerRouter } from "../routes/Quickdraw_Game_Controller.js";

app.use("/api/game", QuickdrawGameControllerRouter);

export default server;
