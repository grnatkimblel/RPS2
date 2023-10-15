const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8100;

app.use(express.json());
app.use(cors());

const db = require("./models");

//Routers
const userRouter = require("./routes/User_Auth");

app.use("/userAuth", userRouter);

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
  });
});
