const express = require("express");
const router = express.Router();

const authenticateToken = require("../helper/authenticateToken");
router.use(authenticateToken);

const { getUsersByList } = require("../helper/getUsers");

let currentGames = [];

router.post("/pregame", async (req, res) => {
  const roster = req.body.roster;
  const fullPlayerInfo = await getUsersByList([
    roster.player_1,
    roster.player_2,
  ]);
  // console.log(fullPlayerInfo);
  const player_1_info = {
    username: fullPlayerInfo[0].username,
    userId: fullPlayerInfo[0].id,
    emoji: fullPlayerInfo[0].player_emoji,
  };
  const player_2_info = {
    username: fullPlayerInfo[1].username,
    userId: fullPlayerInfo[1].id,
    emoji: fullPlayerInfo[1].player_emoji,
  };
  const roundStartTime = Date.now() + 9000;

  currentGames.push(roster);

  return {
    // sessionID: sessionID,
    roundStartTime: roundStartTime,
    player1: player_1_info,
    player2: player_2_info,
  };
});
