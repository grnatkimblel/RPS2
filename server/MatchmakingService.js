const EventEmitter = require("events");
const matchmakingEventEmitter = new EventEmitter();

let playerQueue = [];
let matchMaker = null;
matchmakingEventEmitter.on("newPlayer", (client) => {
  console.log("new player added");
  console.log(client);
  console.log("");
  playerQueue.push(client);
  if (matchMaker == null)
    matchMaker = setInterval(() => {
      //this will need to change
      console.log("matchmaking sweep");
      if (playerQueue.length > 1) {
        playerQueue.forEach((player) => {
          //console.log(playerQueue);
          if (client.playerId != player.playerId) {
            const roster = {
              player1: player.playerId,
              player2: client.playerId,
            };
            //console.log(roster);

            playerQueue.splice(playerQueue.indexOf(client.playerId), 1);
            playerQueue.splice(playerQueue.indexOf(player.playerId), 1);
            //console.log(roster);
            matchmakingEventEmitter.emit(client.playerId, roster);
            matchmakingEventEmitter.emit(player.playerId, roster);
          }
        });
        if (playerQueue.length == 0) {
          clearInterval(matchMaker);
          matchMaker = null;
        }
      }
    }, 2000);
});

module.exports.matchmakingEventEmitter = matchmakingEventEmitter;
