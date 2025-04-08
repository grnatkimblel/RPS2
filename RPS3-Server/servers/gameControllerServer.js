import attachSocket from "../gameSocket.js";
import express from "express";
import cors from "cors";

import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(cors());

//Routers
import { router as QuickdrawGameControllerRouter } from "../routes/Quickdraw_Game_Controller.js";
import { router as TDMGameControllerRouter } from "../routes/TDM_Game_Controller.js";

app.use("/api/game", QuickdrawGameControllerRouter);
app.use("/api/game", TDMGameControllerRouter);

const server = createServer(app);
const io = attachSocket(server);

export default server;
