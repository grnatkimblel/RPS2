const db = require("../models");
const logger = require("../utils/logger");

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


dbSyncParam = process.env.NODE_ENV == "test" ? {force: true} : {}
db.sequelize.sync(dbSyncParam).then(() => {
  app.listen(PORT, () => {
    logger.info(`listening on port http://localhost:${PORT}`);
  });
});
