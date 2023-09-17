const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../helper");
const { matchmakingEventEmitter } = require("../MatchmakingService");

router.post("/random", authenticateToken, async (req, res) => {
  const client = req.body.player;
  matchmakingEventEmitter.once(client.playerId, (roster) => {
    res.json(roster);
  });
  matchmakingEventEmitter.emit("newPlayer", client);

  // const client = req.body.player;
  // console.log(client);
  // playerQueue.push(client);
  // setInterval(() => {
  //   if (playerQueue.length <= 1) {
  //     return;
  //   }
  //   playerQueue.forEach((player) => {
  //     if (player.playerId != client.playerId) {
  //       const roster = {
  //         player1: player.playerId,
  //         player2: client.playerId,
  //       };
  //       res.json(roster); //but this only happens for one player.
  //     }
  //   });
  // }, 2000);

  /*
  
  record the supplied players information in the playerQueue
  determine if a suitable other player exists according to priority.
  if so
    forward their information to the GameController 
    else
    wait until another player is added to the queue and run this redetermination
  
  */
});

module.exports = router;
