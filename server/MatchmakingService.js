const EventEmitter = require("events");
const matchmakingEventEmitter = new EventEmitter();
const { v4: uuidv4 } = require("uuid");
const logger = require("./utils/logger");

let playerQueue = {
  quickplay_Quickdraw_Random: [],
  quickplay_Quickdraw_Search: new Map(), // player_id: player_id
};
let matchMaker = null;
matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Random:newPlayer",
  (client_id) => {
    logger.info("Q:Q:R: Add Player");

    logger.info(client_id);
    logger.info("");
    if (playerQueue.quickplay_Quickdraw_Random.includes(client_id)) return;
    playerQueue.quickplay_Quickdraw_Random.push(client_id);
    logger.info("Q:Q:R: Player Added");
    logger.info(playerQueue.quickplay_Quickdraw_Random);

    if (matchMaker == null)
      matchMaker = setInterval(() => {
        //this will need to change
        logger.info("Q:Q:R: matchmaking sweep");
        if (playerQueue.quickplay_Quickdraw_Random.length > 1) {
          playerQueue.quickplay_Quickdraw_Random.forEach((player_id) => {
            //logger.info(playerQueue.quickplay_Quickdraw_Random);
            if (client_id != player_id) {
              const roster = createQuickDrawRoster(player_id, client_id);
              //logger.info(roster);
              for (player_id in roster.players)
                removePlayerFromList(
                  player_id,
                  playerQueue.quickplay_Quickdraw_Random
                );
              const clientEventName = client_id + "Q:Q:R-New";
              const playerEventName = player_id + "Q:Q:R-New";
              matchmakingEventEmitter.emit(clientEventName, roster);
              matchmakingEventEmitter.emit(playerEventName, roster);
            }
          });
        }
        //if( playerQueue.length) == 1, { nothing }
        if (playerQueue.quickplay_Quickdraw_Random.length == 0) {
          clearInterval(matchMaker);
          matchMaker = null;
        }
      }, 2000);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Random:removePlayer",
  (client_id) => {
    logger.info("Q:Q:R: Remove Player");
    removePlayerFromList(client_id, playerQueue.quickplay_Quickdraw_Random);
    logger.info("QQR Queue after removal");
    logger.info(playerQueue.quickplay_Quickdraw_Random);
    if (playerQueue.quickplay_Quickdraw_Random.length == 0) {
      clearInterval(matchMaker);
      matchMaker = null;
    }
    //respond to the pending queue
    const eventName = client_id + "Q:Q:R-New";
    matchmakingEventEmitter.emit(eventName, false);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:newInvite",
  (client_id, chosenOne_id) => {
    logger.info("Q:Q:S: New Invite");
    //if the other player already has invites pending, check them for the client
    if (playerQueue.quickplay_Quickdraw_Search.has(chosenOne_id)) {
      const chosenOneInvitee =
        playerQueue.quickplay_Quickdraw_Search.get(chosenOne_id);
      if (chosenOneInvitee == client_id) {
        const roster = createQuickDrawRoster(chosenOne_id, client_id);

        //remove player from list
        playerQueue.quickplay_Quickdraw_Search.delete(chosenOne_id);
        const clientEventName = client_id + "Q:Q:S-New";
        const chosenOneEventName = chosenOne_id + "Q:Q:S-New";
        matchmakingEventEmitter.emit(clientEventName, roster);
        matchmakingEventEmitter.emit(chosenOneEventName, roster);
      }
    }
    //if the other player doesnt have pending invites to the client, the client needs
    //to create an invite in the list
    playerQueue.quickplay_Quickdraw_Search.set(client_id, chosenOne_id);
    // logger.info("Invite from ", client_id, "to", chosenOne_id);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:removeInvite",
  (client_id) => {
    playerQueue.quickplay_Quickdraw_Search.delete(client_id);
    const clientEventName = client_id + "Q:Q:S-New";
    matchmakingEventEmitter.emit(clientEventName, false);
    logger.info("Q:Q:S: Remove Invite");
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:checkInviteToClient",
  (client_id, otherPlayer_id) => {
    logger.info("Q:Q:S: Check Invite");
    const clientEventName = client_id + "Q:Q:S:CI";
    if (client_id === otherPlayer_id)
      matchmakingEventEmitter.emit(clientEventName, false);

    // logger.info("Invite checked from ", client_id, "to", otherPlayer_id);
    // logger.info("playerQueue ", playerQueue.quickplay_Quickdraw_Search);
    //check if other player is inviting client
    if (playerQueue.quickplay_Quickdraw_Search.has(otherPlayer_id)) {
      // logger.info("   playerQueue has ", otherPlayer_id);
      const otherPlayerInvitee =
        playerQueue.quickplay_Quickdraw_Search.get(otherPlayer_id);
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

function createQuickDrawRoster(player1_id, player2_id) {
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

module.exports.matchmakingEventEmitter = matchmakingEventEmitter;
module.exports.playerQueue = playerQueue;
