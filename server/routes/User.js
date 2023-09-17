const { authenticateToken } = require("../helper");

const express = require("express");
const router = express.Router();

const { User, RefreshToken } = require("../models");
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

//DELETES
router.delete("/logout", authenticateToken, async (req, res) => {
  try {
    console.log(req.body);
    await RefreshToken.destroy({
      where: {
        refresh_token: req.body.refreshToken,
      },
    });
    res.sendStatus(204);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

module.exports = router;
