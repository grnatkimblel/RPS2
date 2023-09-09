const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

const db = require("./models");

//Routers
const userRouter = require("./routes/User");
const pingRouter = require("./routes/Ping");

app.use("/user", userRouter);
app.use("/", pingRouter);

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});
