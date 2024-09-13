const matchmakingEventEmitter = new EventEmitter();
import EventEmitter from "events";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/logger.js";
import {
  GAMEMODES,
  GAMEMODE_TYPES,
  MATCHMAKING_TYPES,
} from "./shared/enums/gameEnums.js"; //This file name is set in docker compose;

const playerQueue = {
  [GAMEMODE_TYPES.QUICKPLAY]: {
    [GAMEMODES.QUICKDRAW]: {
      [MATCHMAKING_TYPES.RANDOM]: [],
      [MATCHMAKING_TYPES.SEARCH]: new Map(),
    },
    [GAMEMODES.TDM]: {
      [MATCHMAKING_TYPES.RANDOM]: [],
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

matchmakingEventEmitter.on(
  "Random-AddPlayer",
  (client_id, gameType, gameMode) => {
    logger.info("MatchMakingService    AddPlayer called");

    logger.info("MatchMakingService    ", client_id, gameType, gameMode);
    logger.info("");
    let requestQueue =
      playerQueue[gameType][gameMode][MATCHMAKING_TYPES.RANDOM];

    if (requestQueue.includes(client_id)) return;
    requestQueue.push(client_id);
    logger.info(gameType, gameMode, "Player Added");
    logger.info(requestQueue);

    if (matchMaker == null)
      matchMaker = setInterval(() => {
        //this will need to change
        logger.info(gameType, gameMode, "matchmaking sweep");
        if (requestQueue.length > 1) {
          requestQueue.forEach((player_id) => {
            logger.info(requestQueue);
            if (client_id != player_id) {
              const roster = createTwoPlayerRoster(player_id, client_id);
              logger.info(roster);
              for (let player in roster.players) {
                logger.info("removing ", roster.players[player]);
                removePlayerFromList(roster.players[player], requestQueue);
              }
              const clientEventName =
                client_id +
                ">" +
                gameType +
                ":" +
                gameMode +
                ":Random-AddPlayerResponse";
              const playerEventName =
                roster.players["player_1"] +
                ">" +
                gameType +
                ":" +
                gameMode +
                ":Random-AddPlayerResponse";
              logger.info("matchmaker");
              logger.info(clientEventName);
              logger.info(playerEventName);
              matchmakingEventEmitter.emit(clientEventName, roster);
              matchmakingEventEmitter.emit(playerEventName, roster);
            }
          });
        }
        //if( playerQueue.length) == 1, { nothing }
        if (requestQueue.length == 0) {
          clearInterval(matchMaker);
          matchMaker = null;
        }
      }, 2000);
  }
);

matchmakingEventEmitter.on(
  "Random-RemovePlayer",
  (client_id, gameType, gameMode) => {
    logger.info(gameType, gameMode, "Remove Player");
    let requestQueue =
      playerQueue[gameType][gameMode][MATCHMAKING_TYPES.RANDOM];
    removePlayerFromList(client_id, requestQueue);
    logger.info(gameType, gameMode, "Random Queue after removal");
    logger.info(requestQueue);
    if (requestQueue.length == 0) {
      clearInterval(matchMaker);
      matchMaker = null;
    }
    //respond to the pending queue
    const eventName =
      client_id +
      ">" +
      gameType +
      ":" +
      gameMode +
      ":" +
      ":Random-AddPlayerResponse";
    matchmakingEventEmitter.emit(eventName, false);
  }
);

matchmakingEventEmitter.on(
  "Search-AddPlayer",
  (client_id, chosenOne_id, gameType, gameMode) => {
    logger.info(gameType, gameMode, "Search: New Invite");
    let requestQueue =
      playerQueue[gameType][gameMode][MATCHMAKING_TYPES.SEARCH];
    //if the other player already has invites pending, check them for the client
    if (requestQueue.has(chosenOne_id)) {
      const chosenOneInvitee = requestQueue.get(chosenOne_id);
      if (chosenOneInvitee == client_id) {
        const roster = createTwoPlayerRoster(chosenOne_id, client_id);

        //remove player from list
        requestQueue.delete(chosenOne_id);
        const clientEventName =
          client_id +
          ">" +
          gameType +
          ":" +
          gameMode +
          ":" +
          "Search-AddPlayer";
        const chosenOneEventName =
          chosenOne_id +
          ">" +
          gameType +
          ":" +
          gameMode +
          ":" +
          "Search-AddPlayer";
        matchmakingEventEmitter.emit(clientEventName, roster);
        matchmakingEventEmitter.emit(chosenOneEventName, roster);
      }
    }
    //if the other player doesnt have pending invites to the client, the client needs
    //to create an invite in the list
    requestQueue.set(client_id, chosenOne_id);
    // logger.info("Invite from ", client_id, "to", chosenOne_id);
  }
);

matchmakingEventEmitter.on(
  "Search-RemovePlayer",
  (client_id, gameType, gameMode) => {
    let requestQueue =
      playerQueue[gameType][gameMode][MATCHMAKING_TYPES.SEARCH];
    requestQueue.delete(client_id);
    const clientEventName =
      client_id + ">" + gameType + ":" + gameMode + ":" + "Search-AddPlayer";
    matchmakingEventEmitter.emit(clientEventName, false);
    logger.info(gameType, gameMode, "Search: Remove Invite");
  }
);

matchmakingEventEmitter.on(
  "Search-CheckInviteToClient",
  (client_id, otherPlayer_id, gameType, gameMode) => {
    let requestQueue =
      playerQueue[gameType][gameMode][MATCHMAKING_TYPES.SEARCH];
    logger.info(gameType, gameMode, "Search: Check Invite");
    const clientEventName =
      client_id +
      ">" +
      gameType +
      ":" +
      gameMode +
      ":Search:CheckInviteResponse";
    if (client_id === otherPlayer_id)
      matchmakingEventEmitter.emit(clientEventName, false);

    // logger.info("Invite checked from ", client_id, "to", otherPlayer_id);
    // logger.info("playerQueue ", playerQueue.requestQueue);
    //check if other player is inviting client
    if (playerQueue.requestQueue.has(otherPlayer_id)) {
      // logger.info("   playerQueue has ", otherPlayer_id);
      const otherPlayerInvitee = playerQueue.requestQueue.get(otherPlayer_id);
      // logger.info("   otherPlayerInvitee is ", otherPlayerInvitee);
      if (otherPlayerInvitee == client_id) {
        // logger.info("   there is an invite for client from chosenOne");
        matchmakingEventEmitter.emit(clientEventName, true);
      } else {
        matchmakingEventEmitter.emit(clientEventName, false);
        // logger.info("   there is not an invite for client from chosenOne");
      }
    } else matchmakingEventEmitter.emit(clientEventName, false);
  }
);

function createTwoPlayerRoster(player1_id, player2_id) {
  //figure out sessionID
  const rosterId = uuidv4();
  return {
    rosterId: rosterId,
    players: {
      player_1: player1_id,
      player_2: player2_id,
    },
  };
}

function removePlayerFromList(player, array) {
  array.splice(array.indexOf(player), 1);
}

export { matchmakingEventEmitter, playerQueue };

// module.exports.matchmakingEventEmitter = matchmakingEventEmitter;
// module.exports.playerQueue = playerQueue;
