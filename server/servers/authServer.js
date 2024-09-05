const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

//Routers
const userRouter = require("../routes/User_Auth");

app.use("/api/auth", userRouter);

module.exports = app;
