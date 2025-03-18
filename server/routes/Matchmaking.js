import express from "express";
import logger from "../utils/logger.js";
import authenticateToken from "../helper/authenticateToken.js";
import { matchmakingEventEmitter } from "../MatchmakingService.js";

import { getUsersByList } from "../helper/getUsers.js";

import { GAMEMODES, GAMEMODE_TYPES, MATCHMAKING_TYPES } from "../shared/enums/gameEnums.js"; //This file name is set in docker compose;

const router = express.Router();
router.use(authenticateToken);

let doLogging = true;
/*
  The client will call this API to add themselves to a matchmaking queue. Any gamemode/gametype is supported.
  The response will be a list of player ids that have been included in the players roster once the player is matchmade.
  This list of players will be used to create a game session via the pregame API.

  Response:
  {
    wasCancelled: boolean    #indicating if the player was removed from the queue before being matchmade
    roster: [player_id]
  }
*/
router.post("/addPlayer", async (req, res) => {
  const gameType = req.body.gameType;
  const gameMode = req.body.gameMode;
  const matchmakingType = req.body.matchmakingType;

  //validate the arguments to the request
  try {
    validateRequestsGameDetails(gameType, gameMode, matchmakingType);
  } catch (error) {
    logger.info(error);
    req.sendStatus(400);
  }
  const client_id = req.authUser.id;
  const chosenOne_id = req.body.chosenOne_id;
  const playerName = req.authUser.username;
  if (doLogging) {
    // logger.info("authUser: ", req.authUser);
    logger.info(`${playerName} called addPlayer on ${gameType}:${gameMode}:${matchmakingType}`);
  }

  //generate the event name to listen for the response to this request
  let responseEventName;
  try {
    responseEventName = getEventNamesForAddingPlayers(client_id, gameType, gameMode, matchmakingType);
  } catch (error) {
    logger.info(error);
    res.sendStatus(400);
  }
  // logger.info("responseEventName ", responseEventName);

  //initialize a one time listener for the response to this request. This will trigger the http response to the client
  matchmakingEventEmitter.once(responseEventName, (roster) => {
    // logger.info(`MatchmakingService response to AddPlayer from ${playerName}`);
    logger.info("Roster ", roster);
    if (roster == false) {
      res.json({
        wasCancelled: true,
        roster: false,
      });
    } else {
      res.json({
        wasCancelled: false,
        roster: roster,
      });
    }
  });

  //send the request to the matchmaking service to add the player to the queue
  //which queue to add the player to is determined by the matchmakingType
  if (matchmakingType == MATCHMAKING_TYPES.RANDOM) {
    matchmakingEventEmitter.emit(`${MATCHMAKING_TYPES.RANDOM}-AddPlayer`, client_id, gameType, gameMode);
  } else if (matchmakingType == MATCHMAKING_TYPES.SEARCH) {
    matchmakingEventEmitter.emit(
      `${MATCHMAKING_TYPES.SEARCH}-AddPlayer`,
      client_id,
      chosenOne_id, //theres an extra argument for this one
      gameType,
      gameMode
    );
  }
});

// This API will be called by the client to remove themselves from a matchmaking queue.
// It will respond to the current request immediately with a 200 status code.
// It will emit an event to the matchmaking service to respond to the pending AddPlayer request with roster = false.
router.post("/removePlayer", async (req, res) => {
  const gameType = req.body.gameType;
  const gameMode = req.body.gameMode;
  const matchmakingType = req.body.matchmakingType;

  //validate the arguments to the request
  try {
    validateRequestsGameDetails(gameType, gameMode, matchmakingType);
  } catch (error) {
    logger.info(error);
    req.sendStatus(400);
  }
  const client_id = req.authUser.id;
  if (doLogging) {
    const playerName = req.authUser.username;
    logger.info(`${playerName} called removePlayer on ${gameType}:${gameMode}:${matchmakingType}`);
  }

  //emit the request to the matchmaking service to remove the player from the queue
  matchmakingEventEmitter.emit(`${matchmakingType}-RemovePlayer`, client_id, gameType, gameMode);
  res.sendStatus(200);
});

router.post("/search/checkInvite", async (req, res) => {
  //logger.info("Invites Searched for ", req.body.client_id);
  const client_id = req.authUser.id;
  const otherPlayer_id = req.body.otherPlayer_id;
  const gameType = req.body.gameType;
  const gameMode = req.body.gameMode;

  //validate the arguments to the request
  try {
    validateRequestsGameDetails(gameType, gameMode, MATCHMAKING_TYPES.SEARCH);
  } catch (error) {
    logger.info(error);
    req.sendStatus(400);
  }
  if (doLogging) {
    const playerName = req.authUser.username;
    logger.info(`${playerName} called ${gameType}:${gameMode}:Search-CheckInviteToClient`);
  }

  const eventName = client_id + ">" + gameType + ":" + gameMode + ":Search-CheckInviteResponse";
  matchmakingEventEmitter.once(eventName, (isJoinable) => {
    logger.info("found Joinable: ", isJoinable);
    res.send(isJoinable);
  });
  matchmakingEventEmitter.emit("Search-CheckInviteToClient", client_id, otherPlayer_id, gameType, gameMode);
});

function validateRequestsGameDetails(gameType, gameMode, matchmakingType) {
  if (!Object.values(GAMEMODE_TYPES).includes(gameType)) {
    throw new Error("/addPlayer called with bad gameType:", gameType);
  }
  if (!Object.values(GAMEMODES).includes(gameMode)) {
    throw new Error("/addPlayer called with bad gameMode:", gameMode);
  }
  if (!Object.values(MATCHMAKING_TYPES).includes(matchmakingType)) {
    throw new Error("/addPlayer called with bad matchmakingType:", matchmakingType);
  }
}

//generate the event name to emit to the matchmaking service to add a player to a queue
function getEventNamesForAddingPlayers(client_id, gameType, gameMode, matchmakingType) {
  let responseEventName;

  if (gameType == GAMEMODE_TYPES.RANKED) {
    if (matchmakingType == MATCHMAKING_TYPES.SEARCH) {
      throw new Error("Invalid addPlayer request. Ranked Search is an invalid gameType matchmakingType combo");
    }
  }
  responseEventName = client_id + ">" + gameType + ":" + gameMode + ":" + matchmakingType + "-AddPlayerResponse"; // ex. client_id>Quickplayer:Quickdraw:Random-addPlayerResponse

  return responseEventName;
}

export default router;
