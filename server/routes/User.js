const authenticateToken = require("../helper/authenticateToken");
const { getUsersByList, getUsersByName } = require("../helper/getUsers");
const express = require("express");
const router = express.Router();

const { User, RefreshToken } = require("../models");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { matchmakingEventEmitter } = require("../MatchmakingService");

//POSTS
router.post("/createUser", async (req, res) => {
  // console.log("sanity");
  // console.log(req.body);

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
    console.log("Created user: " + createdUser.username);
  } catch {
    res.status(500).send();
  }
});

router.post("/getUsers", authenticateToken, async (req, res) => {
  // console.log(req.body);
  const searchText = req.body.searchText;
  const listOfPlayers = req.body.listOfPlayers;
  // console.log(searchText === "");
  if (searchText === "") {
    //return list of players
    console.log("listOfPlayers: ", listOfPlayers);
    if (listOfPlayers != null && listOfPlayers.length > 0) {
      const responseObject = await getUsersByList(listOfPlayers);

      // console.log("list resObj");
      // console.log(responseObject);
      res.json(responseObject);
    } else {
      res.sendStatus(400);
    }
  } else {
    //search opponent by searchTerm
    // console.log("searchText ", searchText);
    const response = await getUsersByName(searchText);
    // console.log("search response");
    // console.log(response);
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
