const express = require("express");
const router = express.Router();

const authenticateToken = require("../helper/authenticateToken");
const { matchmakingEventEmitter } = require("../MatchmakingService");
const { beginGame } = require("../QuickdrawGameController");
const { getUsersByList } = require("../helper/getUsers");
router.use(authenticateToken);

const debug = {
  Q_Q_R_NR: false,
  Q_Q_R_RR: false,
  Q_Q_S_NI: false,
  Q_Q_S_CI: false,
  Q_Q_S_RI: false,
};

router.post("/quickplay/quickdraw/newRandom", async (req, res) => {
  const client_id = req.body.client_id;
  if (debug.Q_Q_R_NR) {
    const playerName = await getPlayerName(client_id);
    console.log(`${playerName} called Q:Q:R:NR`);
  }
  const eventName = client_id + "Q:Q:R:NR";
  matchmakingEventEmitter.once(eventName, async (roster) => {
    console.log("NR response from MatchmakingService");
    console.log("Roster ", roster);
    if (roster == false) {
      res.json({
        wasCancelled: true,
        gameDetails: roster,
      });
    } else {
      const gameDetails = await beginGame(roster);
      res.json({
        wasCancelled: false,
        gameDetails: gameDetails,
      });
    }
  });
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Random:newPlayer",
    client_id
  );
});

router.post("/quickplay/quickdraw/removeRandom", async (req, res) => {
  const client_id = req.body.client_id;
  if (debug.Q_Q_R_RR) {
    const playerName = await getPlayerName(client_id);
    console.log(`${playerName} called Q:Q:R:RR`);
  }
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Random:removePlayer",
    client_id
  );
  res.sendStatus(200);
});

router.post("/quickplay/quickdraw/search/newInvite", async (req, res) => {
  const client_id = req.body.client_id;
  if (debug.Q_Q_S_NI) {
    const playerName = await getPlayerName(client_id);
    console.log(`${playerName} called Q:Q:R:RR`);
  }
  const chosenOne_id = req.body.chosenOne_id;
  const eventName = client_id + "Q:Q:S:NI";
  matchmakingEventEmitter.once(eventName, async (roster) => {
    if (roster == null) {
      res.sendStatus(409);
    } else {
      const fullGameDetails = await beginGame(roster);
      //limit info and include session jwt
      res.json(fullGameDetails);
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
  //console.log("Invites Searched for ", req.body.client_id);
  const client_id = req.body.client_id;
  if (debug.Q_Q_S_CI) {
    const playerName = await getPlayerName(client_id);
    console.log(`${playerName} called Q:Q:R:RR`);
  }
  const otherPlayer_id = req.body.otherPlayer_id;
  const eventName = client_id + "Q:Q:S:CI";
  matchmakingEventEmitter.once(eventName, (isJoinable) => {
    //console.log("found Joinable: ", isJoinable);
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
  const eventName = client_id + "Q:Q:S:NI";
  if (debug.Q_Q_S_RI) {
    const playerName = await getPlayerName(client_id);
    console.log(`${playerName} called Q:Q:R:RR`);
  }
  matchmakingEventEmitter.emit(eventName, client_id);
  // const eventName = client_id + "Q:Q:S:NI";
  // matchmakingEventEmitter.emit(eventName, null);
  res.sendStatus(200);
});

async function getPlayerName(player_id) {
  const player = await getUsersByList([player_id]);
  return player[0].username;
}

module.exports = router;
