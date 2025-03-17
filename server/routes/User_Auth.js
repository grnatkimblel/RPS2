import express from "express";
import { Op } from "sequelize";

import logger from "../utils/logger.js";
import secrets from "../helper/secrets.js";
import db from "../models/index.js";

// Get the User model from the db object
const { User, RefreshToken } = db.models;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

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
    if (await bcrypt.compare(req.body.password, userFoundInDb.hashed_password)) {
      const accessToken = generateAccessToken(userFoundInDb);
      const refreshToken = jwt.sign(userFoundInDb, secrets.jwtRefreshTokenSecret);
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

  jwt.verify(refreshToken, secrets.jwtRefreshTokenSecret, (err, user) => {
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
  return jwt.sign(user, secrets.jwtAccessTokenSecret, { expiresIn: "10m" });
}

export default router;
