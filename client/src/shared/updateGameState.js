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
const MIN_DISTANCE_SQUARED = PLAYER_HITBOX_SIZE * PLAYER_HITBOX_SIZE;
const RESPAWN_TIME = 5;

function getRandomHand() {
  const random = Math.random();
  return random >= 0.33 ? "rock" : random >= 0.66 ? "paper" : "scissors";
}

function getNewPlayerPosition(position, input, bounds) {
  let newPosition = { ...position };
  //to avoid glitches at the world border, account for up and down/ left and right inputs before calculating new position
  if (input.up) newPosition.y -= 1;
  if (input.down) newPosition.y += 1;
  if (newPosition.y < 0 || newPosition.y > bounds.h) newPosition.y = Math.min(Math.max(newPosition.y, 0), bounds.h);

  if (input.left) newPosition.x -= 1;
  if (input.right) newPosition.x += 1;
  if (newPosition.x < 0 || newPosition.x > bounds.w) newPosition.x = Math.min(Math.max(newPosition.x, 0), bounds.w);
  return newPosition;
}

function shouldPlayersCollide(potentialPlayerPosition, player1, player2) {
  const dx = potentialPlayerPosition.x - player2.position.x;
  const dy = potentialPlayerPosition.y - player2.position.y;
  let playerDistanceSquared = dx * dx + dy * dy;
  return (
    playerDistanceSquared <= MIN_DISTANCE_SQUARED && player1.team !== player2.team && player1.isAlive && player2.isAlive
  );
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
  let newGameState = JSON.parse(JSON.stringify(gameState)); //Deep copy to get fresh state
  let userPlayerState = newGameState.players[input.userId]; //Extract the input user state

  //spawn dead players
  let now = Date.now();
  for (const player of Object.values(newGameState.players)) {
    if (!player.isAlive && player.spawnTime <= now) {
      player.position = player.spawnPoint;
      player.isAlive = true;
      player.hand = getRandomHand();
    }
  }

  //change hands
  if (input.rock) userPlayerState.hand = "rock";
  if (input.paper) userPlayerState.hand = "paper";
  if (input.scissors) userPlayerState.hand = "scissors";

  //move players
  let potentialPlayerPosition = getNewPlayerPosition(userPlayerState.position, input, newGameState.mapSize);
  let hasPlayerCollidedThisFrame = false;

  //check collisions (only if player is moving?)
  for (const otherPlayerId in newGameState.players) {
    if (otherPlayerId !== input.userId) {
      let otherPlayerState = newGameState.players[otherPlayerId];

      if (shouldPlayersCollide(potentialPlayerPosition, userPlayerState, otherPlayerState)) {
        console.log("player will collide with alive opponent");
        //other player will collide
        //other player is opponent
        //other player is alive

        const collisionResult = handleCollision(otherPlayerState, userPlayerState);
        if (collisionResult.winner) {
          collisionResult.winner.score += 1;
          collisionResult.loser.isAlive = false;
          collisionResult.loser.spawnTime = Date.now() + RESPAWN_TIME * 1000;
          if (collisionResult.winner.id === input.userId)
            if (!hasPlayerCollidedThisFrame)
              //move user if they won
              userPlayerState.position = potentialPlayerPosition;
        } else {
          hasPlayerCollidedThisFrame = true;
        }
      } else {
        if (!hasPlayerCollidedThisFrame) userPlayerState.position = potentialPlayerPosition;
      }
    }
  }

  //calculate team score
  let team1ScoreCount = 0;
  let team2ScoreCount = 0;
  for (const player of Object.values(newGameState.players)) {
    //this will require recalculating a teams score based on the players on that teams score each update
    if (player.team === 0) {
      team1ScoreCount += player.score;
    } else if (player.team === 1) {
      team2ScoreCount += player.score;
    }
  }

  newGameState.round.team_1_score = team1ScoreCount;
  newGameState.round.team_2_score = team2ScoreCount;

  return newGameState;
}

export default updateGameState;
