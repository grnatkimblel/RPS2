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
const MIN_DISTANCE_SQUARED = 45 * 45;
const RESPAWN_TIME = 5;

function distanceSquared(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return dx * dx + dy * dy;
}

function getRandomHand() {
  const random = Math.random();
  return random >= 0.33 ? "rock" : random >= 0.66 ? "paper" : "scissors";
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

  //spawn dead players
  for (const playerId in newGameState.players) {
    let now = Date.now();
    if (!newGameState.players[playerId].isAlive) {
      if (newGameState.players[playerId].spawnTime <= now) {
        // console.log(
        //   "player" + newGameState.players[playerId] + "is respawning"
        // );
        // console.log("newGameState.players[playerId].spawnTime");
        // console.log(newGameState.players[playerId].spawnTime);
        // console.log("now");
        // console.log(now);
        newGameState.players[playerId].position =
          newGameState.players[playerId].spawnPoint;
        newGameState.players[playerId].isAlive = true;
        newGameState.players[playerId].hand = getRandomHand();
      }
    }
  }

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
  let playerMovementLockout = false;

  //check collisions (only if player is moving?)
  for (const otherPlayerId in newGameState.players) {
    if (otherPlayerId != input.userId) {
      let otherPlayerPosition = newGameState.players[otherPlayerId].position;
      let playerDistanceSquared = distanceSquared(
        potentialPlayerPosition,
        otherPlayerPosition
      );
      /*
     |-------------------------------------------------------------------------|
     | Player is Opponent | Opponent is dead | Will Collide | Action           |
     |--------------------|------------------|--------------|------------------|
     | No                 | No               | No           | Update Position  |
     | No                 | No               | Yes          | Update Position  |
     | No                 | Yes              | No           | Update Position  |
     | No                 | Yes              | Yes          | Update Position  |
     | Yes                | No               | No           | Update Position  |
     | Yes                | No               | Yes          | Handle Collision |
     | Yes                | Yes              | No           | Update Position  |
     | Yes                | Yes              | Yes          | Update Position  |
     |-------------------------------------------------------------------------|
      opponent is dead and wont collide - update position
      opponent is not dead and wont collide - update position
      opponent is dead and will collide - update position
      opponent is not dead and will collide - do kill logic , if not tie update position
      */

      if (
        playerDistanceSquared <= MIN_DISTANCE_SQUARED &&
        newGameState.players[otherPlayerId].team !=
          newGameState.players[input.userId].team &&
        newGameState.players[otherPlayerId].isAlive &&
        newGameState.players[input.userId].isAlive
      ) {
        console.log("player will collide with alive opponent");
        //other player will collide
        //other player is opponent
        //other player is alive

        const collisionResult = handleCollision(
          newGameState.players[otherPlayerId],
          newGameState.players[input.userId]
        );
        if (collisionResult.winner) {
          collisionResult.winner.score += 1;
          collisionResult.loser.isAlive = false;
          collisionResult.loser.spawnTime = Date.now() + RESPAWN_TIME * 1000;
          if (collisionResult.winner.id == input.userId)
            if (!playerMovementLockout)
              //move user if they won
              newGameState.players[input.userId].position =
                potentialPlayerPosition;
        } else {
          playerMovementLockout = true;
        }
      } else {
        if (!playerMovementLockout)
          newGameState.players[input.userId].position = potentialPlayerPosition;
      }
    }
  }

  //calculate team score
  let team1ScoreCount = 0;
  let team2ScoreCount = 0;
  for (const playerId in newGameState.players) {
    //this will require recalculating a teams score based on the players on that teams score each update
    if (newGameState.players[playerId].team == 0) {
      team1ScoreCount += newGameState.players[playerId].score;
    } else if (newGameState.players[playerId].team == 1) {
      team2ScoreCount += newGameState.players[playerId].score;
    }
  }

  newGameState.round.team_1_score = team1ScoreCount;
  newGameState.round.team_2_score = team2ScoreCount;

  return newGameState;
}

export default updateGameState;
