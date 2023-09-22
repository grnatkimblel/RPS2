const EventEmitter = require("events");
const matchmakingEventEmitter = new EventEmitter();

let playerQueue = {
  quickplay_Quickdraw_Random: [],
  quickplay_Quickdraw_Search: new Map(), // player_id: player_id
};
let matchMaker = null;
matchmakingEventEmitter.on("Quickplay:Quickdraw:Random:newPlayer", (client) => {
  console.log("new player added");
  console.log(client);
  console.log("");
  playerQueue.quickplay_Quickdraw_Random.push(client);
  if (matchMaker == null)
    matchMaker = setInterval(() => {
      //this will need to change
      console.log("matchmaking sweep");
      if (playerQueue.quickplay_Quickdraw_Random.length > 1) {
        playerQueue.quickplay_Quickdraw_Random.forEach((player) => {
          //console.log(playerQueue.quickplay_Quickdraw_Random);
          if (client.id != player.id) {
            const roster = createQuickDrawRoster(player.id, client.id);
            //console.log(roster);
            removeRosterFromList(
              roster,
              playerQueue.quickplay_Quickdraw_Random
            );
            matchmakingEventEmitter.emit(client.id, roster);
            matchmakingEventEmitter.emit(player.id, roster);
          }
        });
      }
      if (playerQueue.quickplay_Quickdraw_Random.length == 0) {
        clearInterval(matchMaker);
        matchMaker = null;
      }
    }, 2000);
});

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
    //if the other player doesnt have pending invites to the client, the client needs to create an invite in the list
    playerQueue.quickplay_Quickdraw_Search.set(client_id, chosenOne_id);
  }
);

matchmakingEventEmitter.on(
  "Quickplay:Quickdraw:Search:removeInvite",
  (client_id) => {
    playerQueue.quickplay_Quickdraw_Search.delete(client_id);
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
