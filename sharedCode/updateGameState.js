/*
input.userId
input.

*/

const PLAYER_HITBOX_SIZE = 45;
const MIN_DISTANCE = 45 * 45;
function updateGameState(gameState, input) {
  let inputClient = input.userId;
  //change hands
  //move players
  let playerState = gameState.players[inputClient];
  let playerStatePositionX = playerState.position.x;
  let playerStatePositionY = playerState.position.y;
  if (input.up) playerStatePositionY -= 1;
  if (input.down) playerStatePositionY += 1;
  if (input.left) playerStatePositionX -= 1;
  if (input.right) playerStatePositionX += 1;
  if (input.rock) playerState.hand = "rock";
  if (input.paper) playerState.hand = "paper";
  if (input.scissors) playerState.hand = "scissors";
  //check collisions

  for (const playerId in gameState.players) {
    if (playerId != inputClient) {
      let otherPlayerPosition = gameState.players[playerId].position;
      let xComponent = playerStatePositionX - otherPlayerPosition.x;
      let yComponent = playerStatePositionY - otherPlayerPosition.y;
      let playerDistance = xComponent * xComponent + yComponent * yComponent;
      if (playerDistance > MIN_DISTANCE) {
        gameState.players[inputClient].position.x = playerStatePositionX;
        gameState.players[inputClient].position.y = playerStatePositionY;
      }
    }
  }

  return gameState;
}

export default updateGameState;
