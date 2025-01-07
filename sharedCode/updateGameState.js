/*

input: 
  input.userId
  input.timestamp this is useless
  input.up
  input.down
  input.left
  input.right
  input.rock
  input.paper
  input.scissors

gamestate: 

*/

const PLAYER_HITBOX_SIZE = 45;
const MIN_DISTANCE = 45 * 45;

function distanceSquared(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return dx * dx + dy * dy;
}

function getNewPlayerPosition(position, input, bounds) {
  let newPosition = { ...position };
  //to avoid glitches at the world border, account for up and down/ left and right inputs before calculating new position
  if (input.up) newPosition.y -= 1;
  if (input.down) newPosition.y += 1;
  if (newPosition.y < 0 || newPosition.y > bounds.h)
    newPosition.y < 0 ? (newPosition.y += 1) : (newPosition.y -= 1);
  if (input.left) newPosition.x -= 1;
  if (input.right) newPosition.x += 1;
  if (newPosition.x < 0 || newPosition.x > bounds.w)
    newPosition.x < 0 ? (newPosition.x += 1) : (newPosition.x -= 1);
  return newPosition;
}

function handleCollision(player1, player2) {
  if (player1.team !== player2.team) {
    if (player1.hand === player2.hand) {
      return { player1, player2 }; // Tie
    } else if (
      (player1.hand === "paper" && player2.hand === "rock") ||
      (player1.hand === "rock" && player2.hand === "scissors") ||
      (player1.hand === "scissors" && player2.hand === "paper")
    ) {
      return { winner: player1, loser: player2 }; // Player 1 wins
    } else {
      return { winner: player2, loser: player1 }; // Player 2 wins
    }
  }
  return { player1, player2 };
}

function updateGameState(gameState, input) {
  let newGameState = JSON.parse(JSON.stringify(gameState)); // Deep copy to get fresh state
  let newPlayerState = newGameState.players[input.userId]; //extract the input user state

  //change hands
  if (input.rock) newPlayerState.hand = "rock";
  if (input.paper) newPlayerState.hand = "paper";
  if (input.scissors) newPlayerState.hand = "scissors";

  //move players

  let potentialPlayerPosition = getNewPlayerPosition(
    newPlayerState.position,
    input,
    newGameState.mapSize
  );

  //check collisions (only if player is moving?)
  for (const otherPlayerId in newGameState.players) {
    if (otherPlayerId != input.userId) {
      let otherPlayerPosition = newGameState.players[otherPlayerId].position;
      let playerDistance = distanceSquared(
        potentialPlayerPosition,
        otherPlayerPosition
      );
      /*
      opponent is dead and wont collide - update position
      opponent is not dead and wont collide - update position
      opponent is dead and will collide - update position
      opponent is not dead and will collide - do kill logic , if not tie update position
      */

      if (playerDistance <= MIN_DISTANCE) {
        if (
          newGameState.players[otherPlayerId].isAlive &&
          newGameState.players[input.userId].isAlive
        ) {
          //opponent is alive and will collide
          if (
            newGameState.players[otherPlayerId].team !=
            newGameState.players[input.userId].team
          ) {
            //players will collide, handle collision

            //players are on different teams
            //rock, paper, scissors
            if (
              newGameState.players[otherPlayerId].hand ==
              newGameState.players[input.userId].hand
            ) {
              //tie, do nothing
            } else {
              const collisionResult = handleCollision(
                newGameState.players[otherPlayerId],
                newGameState.players[input.userId]
              );
              if (collisionResult.winner) {
                collisionResult.winner.score += 1;
                collisionResult.loser.isAlive = false;
              }
            }
          }
        } else {
          newGameState.players[input.userId].position = potentialPlayerPosition;
        }
      } else {
        newGameState.players[input.userId].position = potentialPlayerPosition;
      }
    }
  }

  //calculate team score

  for (const playerId in newGameState.players) {
    //this will require recalculating a teams score based on the players on that teams score each update
    if (newGameState.players[playerId].team == 0) {
      newGameState.round.team_1_score = newGameState.players[playerId].score;
    } else if (newGameState.players[playerId].team == 1) {
      newGameState.round.team_2_score = newGameState.players[playerId].score;
    }
  }

  return newGameState;
}

export default updateGameState;
