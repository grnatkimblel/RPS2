const logger = require("../utils/logger");
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
  //logger.info("/login request");
  //logger.info(req);
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
    //logger.info(userFoundInDb);
    if (
      await bcrypt.compare(req.body.password, userFoundInDb.hashed_password)
    ) {
      const accessToken = generateAccessToken(userFoundInDb);
      const refreshToken = jwt.sign(
        userFoundInDb,
        process.env.REFRESH_TOKEN_SECRET
      );
      await RefreshToken.create({
        refresh_token: refreshToken,
      });
      res.status(200).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
          username: userFoundInDb.username,
          userId: userFoundInDb.id,
          emoji: userFoundInDb.player_emoji,
        },
      });
    } else {
      res.status(401).send("Incorrect Password");
    }
  } catch (e) {
    logger.info(e);
    res.status(500).send();
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
    //logger.info("RefreshToken user param");
    //logger.info(user);
    const accessToken = generateAccessToken({
      //must pass a user without timestamps
      username: user.username,
      hashed_password: user.hashed_password,
      id: user.id,
      emoji: user.player_emoji,
    });
    res.json({ accessToken: accessToken });
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
}

module.exports = router;
