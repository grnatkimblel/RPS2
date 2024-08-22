const express = require("express");
const router = express.Router();
const logger = require("./utils/logger");
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
    logger.info(error);
    req.sendStatus(400);
  }

  const client_id = req.authUser.id;
  logger.info("authUser: ", req.authUser);
  const chosenOne_id = req.body.chosenOne_id;
  const playerName = req.authUser.username;
  if (true) {
    logger.info(
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
    logger.info(error);
    res.sendStatus(400);
  }

  // logger.info("requestEventName ", requestEventName);
  // logger.info("responseEventName ", responseEventName);

  matchmakingEventEmitter.once(responseEventName, async (roster) => {
    logger.info(`MatchmakingService response to AddPlayer from ${playerName}`);
    logger.info("Roster ", roster);
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
    logger.info(error);
    req.sendStatus(400);
  }

  const client_id = req.authUser.id;
  if (true) {
    const playerName = req.authUser.username;
    logger.info(
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
  //logger.info("Invites Searched for ", req.body.client_id);
  const client_id = req.authUser.id;
  if (false) {
    const playerName = req.authUser.username;
    logger.info(`${playerName} called Q:Q:R:RR`);
  }
  const otherPlayer_id = req.body.otherPlayer_id;
  const eventName = client_id + "Q:Q:S:CI";
  matchmakingEventEmitter.once(eventName, (isJoinable) => {
    //logger.info("found Joinable: ", isJoinable);
    res.send(isJoinable);
  });
  matchmakingEventEmitter.emit(
    "Quickplay:Quickdraw:Search:checkInviteToClient",
    client_id,
    otherPlayer_id
  );
});

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

  // logger.info("before returning");
  // logger.info({ requestEventName, responseEventName });
  return { requestEventName, responseEventName };
}

function capitalizeFirstLetter(text) {
  let firstLetter = text.charAt(0).toUpperCase();
  let restOfText = text.slice(1);
  // logger.info(
  //   `capitalize first letter called on ${text}. first letter is ${firstLetter} and restOfText is ${restOfText}`
  // );
  return firstLetter + restOfText;
}

module.exports = router;
