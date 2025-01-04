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

  // let playerStatePositionX = playerState.position.x; //copy to get the position the player *wants* to be in
  // let playerStatePositionY = playerState.position.y; //copy to get the position the player *wants* to be in
  // if (input.up) playerStatePositionY -= 1;
  // if (input.down) playerStatePositionY += 1;
  // if (playerStatePositionY < 0 || playerStatePositionY > gameState.mapHeight)
  //   playerStatePositionY < 0
  //     ? (playerStatePositionY += 1)
  //     : (playerStatePositionY -= 1);
  // if (input.left) playerStatePositionX -= 1;
  // if (input.right) playerStatePositionX += 1;
  // if (playerStatePositionX < 0 || playerStatePositionX > gameState.mapWidth)
  //   playerStatePositionX < 0
  //     ? (playerStatePositionX += 1)
  //     : (playerStatePositionX -= 1);

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
        if (newGameState.players[otherPlayerId].isAlive) {
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
                newGameState.players[otherPlayerId].hand,
                newGameState.players[input.userId].hand
              );
              if (collisionResult.winner) {
                //
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
  let i = 0;
  for (const playerId in newGameState.players) {
    //this will require recalculating a teams score based on the players on that teams score each update
    if (i == 0) {
      newGameState.round.player_1_score = newGameState.players[playerId].score;
    } else if (i == 1) {
      newGameState.round.player_2_score = newGameState.players[playerId].score;
    }
    i += 1;
  }

  return newGameState;
}

// // Helper function for calculating distance squared (more efficient than Math.sqrt)

// // Collision detection function
// function detectCollision(player1, player2, minDistanceSquared) {
//   return (
//     distanceSquared(player1.position, player2.position) <= minDistanceSquared
//   );
// }

// function updatePlayerPosition(player, input, mapBounds) {
//   let newX = player.position.x;
//   let newY = player.position.y;

//   if (input.up) newY = Math.max(0, newY - 1); // Clamp to map bounds
//   if (input.down) newY = Math.min(mapBounds.h, newY + 1);
//   if (input.left) newX = Math.max(0, newX - 1);
//   if (input.right) newX = Math.min(mapBounds.w, newX + 1);

//   return { ...player.position, x: newX, y: newY };
// }

// function updateGameState(gameState, input) {
//   const newGameState = JSON.parse(JSON.stringify(gameState)); // Deep copy
//   const playerState = newGameState.players[input.userId];

//   // Update player's hand
//   if (input.rock) playerState.hand = "rock";
//   if (input.paper) playerState.hand = "paper";
//   if (input.scissors) playerState.hand = "scissors";

//   // Update player's position
//   playerState.position = updatePlayerPosition(playerState, input, {newGameState.mapWidth});

//   // Collision detection and handling
//   for (const otherPlayerId in newGameState.players) {
//     if (otherPlayerId !== input.userId) {
//       const otherPlayer = newGameState.players[otherPlayerId];
//       if (
//         otherPlayer.isAlive &&
//         detectCollision(playerState, otherPlayer, MIN_DISTANCE)
//       ) {
//         const collisionResult = handleCollision(playerState, otherPlayer);

//         if (collisionResult.winner) {
//           collisionResult.loser.isAlive = false;
//           collisionResult.winner.score += 1;

//           if (collisionResult.winner.id == input.userId) {
//             newGameState.round.player_1_score =
//               newGameState.players[Object.keys(newGameState.players)[0]].score;
//             newGameState.round.player_2_score =
//               newGameState.players[Object.keys(newGameState.players)[1]].score;
//           } else {
//             newGameState.round.player_1_score =
//               newGameState.players[Object.keys(newGameState.players)[1]].score;
//             newGameState.round.player_2_score =
//               newGameState.players[Object.keys(newGameState.players)[0]].score;
//           }
//         }
//       }
//     }
//   }

//   return newGameState;
// }
export default updateGameState;
