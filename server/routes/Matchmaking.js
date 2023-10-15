const express = require("express");
const router = express.Router();

const authenticateToken = require("../helper/authenticateToken");
const { matchmakingEventEmitter } = require("../MatchmakingService");

const { getUsersByList } = require("../helper/getUsers");
router.use(authenticateToken);

const validGameTypes = ["quickplay", "ranked"];
const validGameModes = ["quickdraw", "tdm", "s&d"];
const validMatchmakingTypes = ["random", "search"];

router.post("/addPlayer", async (req, res) => {
  const gameType = req.body.gameType;
  const gameMode = req.body.gameMode;
  const matchmakingType = req.body.matchmakingType;
  try {
    validateRequestsGameDetails(gameType, gameMode, matchmakingType);
  } catch (error) {
    console.log(error);
    req.sendStatus(400);
  }

  const client_id = req.body.client_id;
  const chosenOne_id = req.body.chosenOne_id;
  const playerName = await getPlayerName(client_id);
  if (true) {
    console.log(
      `${playerName} called addPlayer on ${gameType}:${gameMode}:${matchmakingType}`
    );
  }

  let requestEventName, responseEventName;
  try {
    ({ requestEventName, responseEventName } = getEventNamesForAddingPlayers(
      client_id,
      gameType,
      gameMode,
      matchmakingType
    ));
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }

  // console.log("requestEventName ", requestEventName);
  // console.log("responseEventName ", responseEventName);

  matchmakingEventEmitter.once(responseEventName, async (roster) => {
    console.log(`MatchmakingService response to AddPlayer from ${playerName}`);
    console.log("Roster ", roster);
    if (roster == false) {
      res.json({
        wasCancelled: true,
        roster: roster,
      });
    } else {
      res.json({
        wasCancelled: false,
        roster: roster,
      });
    }
  });

  matchmakingEventEmitter.emit(requestEventName, client_id, chosenOne_id);
});

router.post("/removePlayer", async (req, res) => {
  const gameType = req.body.gameType;
  const gameMode = req.body.gameMode;
  const matchmakingType = req.body.matchmakingType;
  try {
    validateRequestsGameDetails(gameType, gameMode, matchmakingType);
  } catch (error) {
    console.log(error);
    req.sendStatus(400);
  }

  const client_id = req.body.client_id;
  if (true) {
    const playerName = await getPlayerName(client_id);
    console.log(
      `${playerName} called removePlayer on ${gameType}:${gameMode}:${matchmakingType}`
    );
  }

  let requestEventName = `${capitalizeFirstLetter(
    gameType
  )}:${capitalizeFirstLetter(gameMode)}:${capitalizeFirstLetter(
    matchmakingType
  )}:${matchmakingType == "random" ? "removePlayer" : "removeInvite"}`;

  matchmakingEventEmitter.emit(requestEventName, client_id);
  res.sendStatus(200);
});

router.post("/quickplay/quickdraw/search/checkInvite", async (req, res) => {
  //console.log("Invites Searched for ", req.body.client_id);
  const client_id = req.body.client_id;
  if (false) {
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

async function getPlayerName(player_id) {
  const player = await getUsersByList([player_id]);
  return player[0].username;
}

function validateRequestsGameDetails(gameType, gameMode, matchmakingType) {
  if (!validGameTypes.includes(gameType)) {
    throw new Error("/addPlayer called with bad gameType:", gameType);
  }
  if (!validGameModes.includes(gameMode)) {
    throw new Error("/addPlayer called with bad gameMode:", gameMode);
  }
  if (!validMatchmakingTypes.includes(matchmakingType)) {
    throw new Error(
      "/addPlayer called with bad matchmakingType:",
      matchmakingType
    );
  }
}

function getEventNamesForAddingPlayers(
  client_id,
  gameType,
  gameMode,
  matchmakingType
) {
  let requestEventName;
  let responseEventName;

  if (gameType == "ranked") {
    if (matchmakingType == "search") {
      throw new Error(
        "Invalid addPlayer request. Ranked Search is an invalid gameType matchmakingType combo"
      );
    }
  }

  requestEventName = `${capitalizeFirstLetter(
    gameType
  )}:${capitalizeFirstLetter(gameMode)}:${capitalizeFirstLetter(
    matchmakingType
  )}:${matchmakingType == "random" ? "newPlayer" : "newInvite"}`;

  let responseEventGameModeName =
    gameMode == "quickdraw"
      ? gameMode.charAt(0).toUpperCase()
      : gameMode.toUpperCase();

  responseEventName =
    client_id +
    gameType.charAt(0).toUpperCase() +
    ":" +
    responseEventGameModeName +
    ":" +
    matchmakingType.charAt(0).toUpperCase() +
    "-New";

  // console.log("before returning");
  // console.log({ requestEventName, responseEventName });
  return { requestEventName, responseEventName };
}

function capitalizeFirstLetter(text) {
  let firstLetter = text.charAt(0).toUpperCase();
  let restOfText = text.slice(1);
  // console.log(
  //   `capitalize first letter called on ${text}. first letter is ${firstLetter} and restOfText is ${restOfText}`
  // );
  return firstLetter + restOfText;
}

module.exports = router;
