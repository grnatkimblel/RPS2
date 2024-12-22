/*
input.userId
input.

*/

function updateGameState(gameState, input) {
  let inputClient = input.userId;
  //change hands
  //move players
  let playerState = gameState.players[inputClient];
  if (input.up) playerState.position.y -= 1;
  if (input.down) playerState.position.y += 1;
  if (input.left) playerState.position.x -= 1;
  if (input.right) playerState.position.x += 1;
  //check collisions

  return gameState;
}

export default updateGameState;
