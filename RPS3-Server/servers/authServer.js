import express from "express";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());

//Routers
import userRouter from "../routes/User_Auth.js";

app.use("/api/auth", userRouter);

export default app;
