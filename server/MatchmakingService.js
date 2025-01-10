import EventEmitter from "events";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/logger.js";
import MatchmakingQueue from "./MatchmakingQueue.js";
import { GAMEMODES, GAMEMODE_TYPES, MATCHMAKING_TYPES } from "./shared/enums/gameEnums.js"; //This file name is set in docker compose;

const matchmakingEventEmitter = new EventEmitter();

const matchmakingQueues = {
  [GAMEMODE_TYPES.QUICKPLAY]: {
    [GAMEMODES.QUICKDRAW]: {
      [MATCHMAKING_TYPES.RANDOM]: new MatchmakingQueue(
        GAMEMODE_TYPES.QUICKPLAY,
        GAMEMODES.QUICKDRAW,
        MATCHMAKING_TYPES.RANDOM
      ),
      [MATCHMAKING_TYPES.SEARCH]: new MatchmakingQueue(
        GAMEMODE_TYPES.QUICKPLAY,
        GAMEMODES.QUICKDRAW,
        MATCHMAKING_TYPES.SEARCH
      ),
    },
    [GAMEMODES.TDM]: {
      [MATCHMAKING_TYPES.RANDOM]: new MatchmakingQueue(
        GAMEMODE_TYPES.QUICKPLAY,
        GAMEMODES.TDM,
        MATCHMAKING_TYPES.RANDOM
      ),
      // [MATCHMAKING_TYPES.SEARCH]: new Map()
    },
    // [GAMEMODES.SEARCH]: {
    //   [MATCHMAKING_TYPES.RANDOM]: [],
    //   [MATCHMAKING_TYPES.SEARCH]: new Map()
    // }
  },
  [GAMEMODE_TYPES.RANKED]: {
    // [GAMEMODES.QUICKDRAW]: {
    //   [MATCHMAKING_TYPES.RANDOM]: [],
    // },
    // [GAMEMODES.TDM]: {
    //   [MATCHMAKING_TYPES.RANDOM]: [],
    // },
    // [GAMEMODES.SEARCH]: {
    //   [MATCHMAKING_TYPES.RANDOM]: [],
    // }
  },
};

let matchMaker = null;

/*
AddPlayer is responsible for adding a new players to the pool of players waiting to 
play a game. 
There are two parts of this function:
1. Add the player to the appropriate queue
2. Poll the queue checking to see if the queue size is large enough to create a new game
3. Respond to the user with their roster details when it is ready.

ReWrite
1. Add the player to the appropriate queue
2. Check if the queue size is equal to the queue.validRosterSizeMin
  true. generate roster, emit to all clients the roster details
  false. nothing
*/

matchmakingEventEmitter.on("Random-AddPlayer", (client_id, gameType, gameMode) => {
  // logger.info("MatchMakingService    AddPlayer called");

  // logger.info("MatchMakingService    ", client_id, gameType, gameMode);
  // logger.info("");
  let matchmakingQueue = matchmakingQueues[gameType][gameMode][MATCHMAKING_TYPES.RANDOM];
  matchmakingQueue.addPlayer(client_id); //could be avoided when numPlayers == validRosterSizeMin - 1
  logger.info(matchmakingQueue);

  if (matchmakingQueue.getNumPlayers() >= matchmakingQueue.validRosterSizeMin) {
    let playerIdList = matchmakingQueue.getQueue();
    logger.info("playerIdList");
    logger.info(playerIdList);
    //first in first out,
    const rosterIds = playerIdList.slice(0, matchmakingQueue.validRosterSizeMin + 1);
    logger.info("rosterIds");
    logger.info(rosterIds);
    //create roster
    const roster = createRoster(...rosterIds);
    logger.info("roster");
    logger.info(roster);
    for (const playerId of rosterIds) {
      //send roster to all players in it
      matchmakingQueue.removePlayer(playerId);
      const playerEventName = getEventStringName(playerId, gameType, gameMode, "Random-AddPlayerResponse");
      matchmakingEventEmitter.emit(playerEventName, roster);
    }
  }
  // if (matchMaker == null) {
  //   matchMaker = setInterval(() => {
  //     //this will need to change
  //     logger.info(gameType, gameMode, "matchmaking sweep");
  //     if (matchmakingQueue.getNumPlayers() > 1) {
  //       logger.info("create roster");
  //       matchmakingQueue.getQueue().forEach((player_id) => {
  //         logger.info(matchmakingQueue);
  //         if (client_id != player_id) {
  //           const roster = createTwoPlayerRoster(player_id, client_id);
  //           logger.info(roster);
  //           for (let player in roster.players) {
  //             logger.info("removing ", roster.players[player]);
  //             matchmakingQueue.removePlayer(roster.players[player]);
  //             // removePlayerFromList(roster.players[player], matchmakingQueue);
  //           }
  //           const clientEventName = getEventStringName(
  //             client_id,
  //             gameType,
  //             gameMode,
  //             "Random-AddPlayerResponse"
  //           );

  //           const playerEventName = getEventStringName(
  //             roster.players["player_1"],
  //             gameType,
  //             gameMode,
  //             "Random-AddPlayerResponse"
  //           );

  //           logger.info("matchmaker");
  //           logger.info(clientEventName);
  //           logger.info(playerEventName);
  //           matchmakingEventEmitter.emit(clientEventName, roster);
  //           matchmakingEventEmitter.emit(playerEventName, roster);
  //         }
  //       });
  //     }

  //     if (matchmakingQueue.getNumPlayers() == 0) {
  //       clearInterval(matchMaker);
  //       matchMaker = null;
  //     }
  //   }, 2000);
  // }
});

matchmakingEventEmitter.on("Random-RemovePlayer", (client_id, gameType, gameMode) => {
  logger.info(gameType, gameMode, "Remove Player");
  let matchmakingQueue = matchmakingQueues[gameType][gameMode][MATCHMAKING_TYPES.RANDOM];
  matchmakingQueue.removePlayer(client_id);

  // if (matchmakingQueue.getNumPlayers() == 0) {
  //   clearInterval(matchMaker);
  //   matchMaker = null;
  // }
  //respond to the pending queue
  const eventName = getEventStringName(client_id, gameType, gameMode, "Random-AddPlayerResponse");
  matchmakingEventEmitter.emit(eventName, false); //this could be handled on matchmaking side but its more readable this way?
});

matchmakingEventEmitter.on("Search-AddPlayer", (client_id, chosenOne_id, gameType, gameMode) => {
  logger.info(gameType, gameMode, "Search: New Invite");
  let matchmakingQueue = matchmakingQueues[gameType][gameMode][MATCHMAKING_TYPES.SEARCH];
  //if the other player already has invites pending, check them for the client
  if (matchmakingQueue.hasPlayer(chosenOne_id)) {
    const chosenOneInvitee = matchmakingQueue.getInvitee(chosenOne_id);
    if (chosenOneInvitee == client_id) {
      const roster = createRoster(chosenOne_id, client_id);

      //remove player from list
      matchmakingQueue.removePlayer(chosenOne_id);
      const clientEventName = getEventStringName(client_id, gameType, gameMode, "Search-AddPlayerResponse");
      const chosenOneEventName = getEventStringName(chosenOne_id, gameType, gameMode, "Search-AddPlayerResponse");
      matchmakingEventEmitter.emit(clientEventName, roster);
      matchmakingEventEmitter.emit(chosenOneEventName, roster);
    }
  }
  //if the other player doesnt have pending invites to the client, the client needs
  //to create an invite in the list
  matchmakingQueue.addPlayer(client_id, chosenOne_id);
  // logger.info("Invite from ", client_id, "to", chosenOne_id);
});

matchmakingEventEmitter.on("Search-RemovePlayer", (client_id, gameType, gameMode) => {
  logger.info(gameType, gameMode, "Search: Remove Invite");
  let matchmakingQueue = matchmakingQueues[gameType][gameMode][MATCHMAKING_TYPES.SEARCH];
  matchmakingQueue.removePlayer(client_id);
  const clientEventName = getEventStringName(client_id, gameType, gameMode, "Search-AddPlayerResponse");

  matchmakingEventEmitter.emit(clientEventName, false);
});

matchmakingEventEmitter.on("Search-CheckInviteToClient", (client_id, otherPlayer_id, gameType, gameMode) => {
  logger.info(gameType, gameMode, "Search: Check Invite");
  let matchmakingQueue = matchmakingQueues[gameType][gameMode][MATCHMAKING_TYPES.SEARCH];
  logger.info(matchmakingQueue);
  const clientEventName = getEventStringName(client_id, gameType, gameMode, "Search-CheckInviteResponse");
  if (client_id === otherPlayer_id) matchmakingEventEmitter.emit(clientEventName, false);

  // logger.info("Invite checked from ", client_id, "to", otherPlayer_id);
  // logger.info("matchmakingQueues ", matchmakingQueues.matchmakingQueue);
  //check if other player is inviting client

  if (matchmakingQueue.checkInviteToClient(client_id, otherPlayer_id)) {
    matchmakingEventEmitter.emit(clientEventName, true);
  } else {
    matchmakingEventEmitter.emit(clientEventName, false);
  }
});

// function createTwoPlayerRoster(player1_id, player2_id) {
//   //figure out sessionID
//   const rosterId = uuidv4();
//   return {
//     rosterId: rosterId,
//     players: {
//       player_1: player1_id,
//       player_2: player2_id,
//     },
//   };
// }

function createRoster(...playerIds) {
  //figure out sessionID
  const rosterId = uuidv4();
  return {
    rosterId: rosterId,
    players: playerIds,
  };
}

function getEventStringName(id, gameType, gameMode, eventName) {
  return id + ">" + gameType + ":" + gameMode + ":" + eventName;
}

export { matchmakingEventEmitter, matchmakingQueues };
