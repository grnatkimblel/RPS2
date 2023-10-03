/*
this needs a method to be called by the Matchmaking service that will take in the roster as input
and output the following:

    SessionID: a JWT the player will use to respond with. This will contain the round of the game,
        the hand of the player, and other info the server needs from the client
    RoundStartTime: A time in the future when the players will respond to the server if neither players
        have decided to run
    player1:
        //information related to what needs to be displayed for the player
    player2:
        //information related to what needs to be displayed for the player

*/

const { getUsersByList } = require("./helper/getUsers");

let currentGames = [];

async function beginGame(roster) {
  const fullPlayerInfo = await getUsersByList([
    roster.player_1,
    roster.player_2,
  ]);
  // console.log(fullPlayerInfo);
  const player_1_info = {
    username: fullPlayerInfo[0].username,
    userId: fullPlayerInfo[0].id,
    emoji: fullPlayerInfo[0].player_emoji,
  };
  const player_2_info = {
    username: fullPlayerInfo[1].username,
    userId: fullPlayerInfo[1].id,
    emoji: fullPlayerInfo[1].player_emoji,
  };
  const roundStartTime = Date.now() + 9000;

  currentGames.push(roster);

  return {
    // sessionID: sessionID,
    roundStartTime: roundStartTime,
    player1: player_1_info,
    player2: player_2_info,
  };
}

module.exports = {
  beginGame,
};
