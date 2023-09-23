const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../helper");
const { matchmakingEventEmitter } = require("../MatchmakingService");

router.use(authenticateToken);

router.post("/quickplay/quickdraw/random", async (req, res) => {
  const client_id = req.body.client_id;
  matchmakingEventEmitter.once(client_id, (roster) => {
    res.json(roster);
  });
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Random:newPlayer",
    client_id
  );

  /*
  
  record the supplied players information in the playerQueue
  determine if a suitable other player exists according to priority.
  if so
    forward their information to the GameController 
    else
    wait until another player is added to the queue and run this redetermination
  
  */
});

router.post("/quickplay/quickdraw/search/newInvite", async (req, res) => {
  const client_id = req.body.client_id;
  const chosenOne_id = req.body.chosenOne_id;
  matchmakingEventEmitter.once(client_id, (roster) => {
    if (roster == null) {
      res.sendStatus(409);
    } else {
      res.json(roster);
    }
  });
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Search:newInvite",
    client_id,
    chosenOne_id
  );
  /*
  
  record the supplied players information in the playerQueue
  determine if a suitable other player exists according to priority.
  if so
    forward their information to the GameController 
    else
    wait until another player is added to the queue and run this redetermination
  
  */
});

router.post("/quickplay/quickdraw/search/checkInvite", async (req, res) => {
  console.log("Invites Searched for ", req.body.client_id);
  const client_id = req.body.client_id;
  const otherPlayer_id = req.body.otherPlayer_id;
  matchmakingEventEmitter.once(client_id, (isJoinable) => {
    res.send(isJoinable);
  });
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Search:checkInviteToClient",
    client_id,
    otherPlayer_id
  );
});

router.post("/quickplay/quickdraw/search/removeInvite", async (req, res) => {
  const client_id = req.body.client_id;
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Search:removeInvite",
    client_id
  );
  matchmakingEventEmitter.emit(client_id, null);
  res.sendStatus(200);
});

module.exports = router;
