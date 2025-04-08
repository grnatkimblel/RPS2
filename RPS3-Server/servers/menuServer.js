import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

//Routers
import userRouter from "../routes/User.js";
import pingRouter from "../routes/Ping.js";
import matchMakingRouter from "../routes/Matchmaking.js";

app.use("/api/menu/user", userRouter);
app.use("/api/menu/", pingRouter);
app.use("/api/menu/matchmaking", matchMakingRouter);

export default app;
