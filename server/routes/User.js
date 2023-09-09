const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config", ".env") });

const express = require("express");
const router = express.Router();

const { User } = require("../models");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//POSTS
router.post("/createUser", async (req, res) => {
  console.log("sanity");
  console.log(req.body);

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const entryEmoji = req.body.player_emoji ?? "";
    const user = {
      username: req.body.username,
      hashed_password: hashedPassword,
      player_emoji: entryEmoji,
    };
    //console.log("user to be created");
    //console.log(user);
    const createdUser = await User.create(user);
    res.json(createdUser.toJSON());
    res.status(201).send();
    //console.log("Created user: " + createdUser.username);
  } catch {
    res.status(500).send();
  }
});

//GETS
router.get("/getUsers", authenticateToken, async (req, res) => {
  const listOfUsers = await User.findAll();
  res.json(listOfUsers);
});

//MIDDLEWARE
function authenticateToken(req, res, next) {
  console.log("middleware in use");
  const authHeader = req.headers["authorization"];
  //console.log(req.headers);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; //to set req for future functions
    //console.log("calling next function");
    next();
  });
}

module.exports = router;
