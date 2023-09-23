const EventEmitter = require("events");
const matchmakingEventEmitter = new EventEmitter();

let playerQueue = {
  quickplay_Quickdraw_Random: [],
  quickplay_Quickdraw_Search: new Map(), // player_id: player_id
};
let matchMaker = null;
matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Random:newPlayer",
  (client_id) => {
    console.log("new player added");
    console.log(client_id);
    console.log("");
    playerQueue.quickplay_Quickdraw_Random.push(client_id);
    if (matchMaker == null)
      matchMaker = setInterval(() => {
        //this will need to change
        console.log("matchmaking sweep");
        if (playerQueue.quickplay_Quickdraw_Random.length > 1) {
          playerQueue.quickplay_Quickdraw_Random.forEach((player_id) => {
            //console.log(playerQueue.quickplay_Quickdraw_Random);
            if (client_id != player_id) {
              const roster = createQuickDrawRoster(player_id, client_id);
              //console.log(roster);
              removeRosterFromList(
                roster,
                playerQueue.quickplay_Quickdraw_Random
              );
              matchmakingEventEmitter.emit(client_id, roster);
              matchmakingEventEmitter.emit(player_id, roster);
            }
          });
        }
        if (playerQueue.quickplay_Quickdraw_Random.length == 0) {
          clearInterval(matchMaker);
          matchMaker = null;
        }
      }, 2000);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:newInvite",
  (client_id, chosenOne_id) => {
    //if the other player already has invites pending, check them for the client
    if (playerQueue.quickplay_Quickdraw_Search.has(chosenOne_id)) {
      const chosenOneInvitee =
        playerQueue.quickplay_Quickdraw_Search.get(chosenOne_id);
      if (chosenOneInvitee == client_id) {
        const roster = createQuickDrawRoster(chosenOne_id, client_id);

        //remove player from list
        playerQueue.quickplay_Quickdraw_Search.delete(chosenOne_id);

        matchmakingEventEmitter.emit(client_id, roster);
        matchmakingEventEmitter.emit(chosenOne_id, roster);
      }
    }
    //if the other player doesnt have pending invites to the client, the client needs
    //to create an invite in the list
    playerQueue.quickplay_Quickdraw_Search.set(client_id, chosenOne_id);
    // console.log("Invite from ", client_id, "to", chosenOne_id);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:removeInvite",
  (client_id) => {
    playerQueue.quickplay_Quickdraw_Search.delete(client_id);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:checkInviteToClient",
  (client_id, otherPlayer_id) => {
    if (client_id === otherPlayer_id)
      matchmakingEventEmitter.emit(client_id, false);

    // console.log("Invite checked from ", client_id, "to", otherPlayer_id);
    // console.log("playerQueue ", playerQueue.quickplay_Quickdraw_Search);
    //check if other player is inviting client
    if (playerQueue.quickplay_Quickdraw_Search.has(otherPlayer_id)) {
      // console.log("   playerQueue has ", otherPlayer_id);
      const otherPlayerInvitee =
        playerQueue.quickplay_Quickdraw_Search.get(otherPlayer_id);
      // console.log("   otherPlayerInvitee is ", otherPlayerInvitee);
      if (otherPlayerInvitee == client_id) {
        // console.log("   there is an invite for client from chosenOne");
        matchmakingEventEmitter.emit(client_id, true);
      } else {
        matchmakingEventEmitter.emit(client_id, false);
        // console.log("   there is not an invite for client from chosenOne");
      }
    } else matchmakingEventEmitter.emit(client_id, false);
  }
);

function createQuickDrawRoster(player1_id, player2_id) {
  return {
    player_1: player1_id,
    player_2: player2_id,
  };
}

function removeRosterFromList(roster, array) {
  for (const player in roster) array.splice(array.indexOf(roster[player]), 1);
}

module.exports.matchmakingEventEmitter = matchmakingEventEmitter;
