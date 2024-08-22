const db = require("../models");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8100;

app.use(express.json());
app.use(cors());

//Routers
const userRouter = require("../routes/User_Auth");

app.use("/api/auth", userRouter);

dbSyncParam = process.env.NODE_ENV == "test" ? {force: true} : {}
db.sequelize.sync(dbSyncParam).then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});