import db from "../models/index.js";
// Get the User model from the db object
const { User, RefreshToken } = db;
import { getUsersByList, getUsersByName } from "../helper/getUsers.js";
import logger from "../utils/logger.js";
import authenticateToken from "../helper/authenticateToken.js";

import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

//POSTS
router.post("/createUser", async (req, res) => {
  // logger.info("sanity");
  // logger.info(req.body);

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const entryEmoji = req.body.player_emoji ?? "";
    const user = {
      username: req.body.username,
      hashed_password: hashedPassword,
      player_emoji: entryEmoji,
    };
    //logger.info("user to be created");
    //logger.info(user);
    const createdUser = await User.create(user);
    res.status(201).json(createdUser.toJSON());
    logger.info("Created user: " + createdUser.username);
  } catch {
    res.status(500).send();
  }
});

router.post("/getUsers", authenticateToken, async (req, res) => {
  // logger.info(req.body);
  const searchText = req.body.searchText;
  const listOfPlayers = req.body.listOfPlayers;
  // logger.info(searchText === "");
  if (searchText === "") {
    //return list of players
    logger.info("listOfPlayers: ", listOfPlayers);
    if (listOfPlayers != null && listOfPlayers.length > 0) {
      const responseObject = await getUsersByList(listOfPlayers);

      // logger.info("list resObj");
      // logger.info(responseObject);
      res.json(responseObject);
    } else {
      res.sendStatus(400);
    }
  } else {
    //search opponent by searchTerm
    // logger.info("searchText ", searchText);
    const response = await getUsersByName(searchText);
    // logger.info("search response");
    // logger.info(response);
    res.json(response);
  }
  /* 
  accepts an array of player_ids or an opponents username
  */
});

//GETS

//DELETES
router.delete("/logout", authenticateToken, async (req, res) => {
  try {
    logger.info(req.body);
    await RefreshToken.destroy({
      where: {
        refresh_token: req.body.refreshToken,
      },
    });
    res.sendStatus(204);
  } catch (e) {
    logger.info(e);
    res.sendStatus(400);
  }
});

export default router;
