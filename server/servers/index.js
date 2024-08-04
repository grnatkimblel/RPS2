const db = require("../models");

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

//Routers
const userRouter = require("../routes/User");
const pingRouter = require("../routes/Ping");
const matchMakingRouter = require("../routes/Matchmaking");

app.use("/api/menu/user", userRouter);
app.use("/api/menu/", pingRouter);
app.use("/api/menu/matchmaking", matchMakingRouter);

db.sequelize.sync({}).then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});
