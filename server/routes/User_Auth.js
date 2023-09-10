const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config", ".env") });

const express = require("express");
const router = express.Router();

const { User, RefreshToken } = require("../models");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//POSTS
router.post("/login", async (req, res) => {
  //console.log("/login request");
  //console.log(req);
  const userFoundInDb = await User.findOne({
    where: {
      username: {
        [Op.like]: req.body.username,
      },
    },
    raw: true, //returns json instead of class instance of the model
  });
  if (userFoundInDb == null) {
    return res.status(404).send("Cannot find user");
  }
  try {
    //console.log(userFoundInDb);
    if (
      await bcrypt.compare(req.body.password, userFoundInDb.hashed_password)
    ) {
      const accessToken = generateAccessToken(userFoundInDb);
      const refreshToken = jwt.sign(
        userFoundInDb,
        process.env.REFRESH_TOKEN_SECRET
      );
      refreshTokenEntry = await RefreshToken.create({
        refresh_token: refreshToken,
      });
      res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
          username: userFoundInDb.username,
          userId: userFoundInDb.id,
          emoji: userFoundInDb.player_emoji,
        },
      });
    } else {
      res.send("Incorrect Password");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.delete("/logout", async (req, res) => {
  try {
    //console.log(req.refreshToken);
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

router.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res.sendStatus(400);

  const refreshTokenFoundInDb = await RefreshToken.findOne({
    where: {
      refresh_token: {
        [Op.like]: refreshToken,
      },
    },
    raw: true, //returns json instead of class instance of the model
  });
  if (refreshTokenFoundInDb == null) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    //console.log("RefreshToken user param");
    //console.log(user);
    const accessToken = generateAccessToken({
      //must pass a user without timestamps
      username: user.username,
      hashed_password: user.hashed_password,
    });
    res.json({ accessToken: accessToken });
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

module.exports = router;
