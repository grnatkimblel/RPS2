const authenticateToken = require("../helper/authenticateToken");

const express = require("express");
const router = express.Router();

router.use(authenticateToken);

const { getUsersByList } = require("../helper/getUsers");
const { GameHeader } = require("../models");

const COUNTDOWN_TIME = 3000;
/*

game = {
  rosterId: rosterId,
    players: {
      player_1: player1_id,
      player_2: player2_id,
    }
  checkInStatus: {
      player_1: false,
      player_2: false,
    },
}

gameHeader : {
  game_id: 
  winner: 
  loser:
  player_1_id
  player_2
}

*/

let activeGames = [];

router.post("/quickdraw/pregame", async (req, res) => {
  console.log(" /quickdraw/pregame called successfully");
  const roster = req.body.roster;
  console.log(roster);
  const players = roster.players;
  const fullPlayerInfo = await getUsersByList([
    players.player_1,
    players.player_2,
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
  const roundStartTime = Date.now() + COUNTDOWN_TIME;

  if (
    !activeGames.some((game) => {
      return game.rosterId == roster.rosterId;
    })
  )
    activeGames.push(createPotentialGame(roster));

  res.json({
    sessionId: roster.rosterId,
    roundStartTime: roundStartTime,
    player1: player_1_info,
    player2: player_2_info,
  });
});

router.post("/quickplay/run", async (req, res) => {
  const client_id = req.authUser.id;
  const session_id = req.body.session_id;
  const game = findGameWithPlayer(session_id, client_id);

  if (game) {
    activeGames.splice(activeGames.indexOf(game), 1);
    console.log("game removed");
    console.log("new activeGames");
    console.log(activeGames);
  } else {
    //game doesn't exist or other player already ran
    //do nothing
  }
  res.sendStatus(200);
});

router.post("/quickplay/startGame", async (req, res) => {
  //Both clients must call this api before any actions are taken
  const session_id = req.body.session_id;
  const client_id = req.authUser.id;
  console.log("startGame called");
  const game = findGameWithPlayer(session_id, client_id);
  if (game) {
    if (isPlayer1(game, client_id)) {
      game.checkInStatus.player_1 = true;
    } else {
      game.checkInStatus.player_2 = true;
    }
    console.log("checkInStatus");
    console.log(game.checkInStatus);
    //If both players have checked in, create the GameHeader entry
    if (game.checkInStatus.player_1 && game.checkInStatus.player_2) {
      const createdGameHeader = await GameHeader.findOrCreate({
        where: {
          game_id: session_id,
        },
        defaults: {
          winner: null,
          loser: null,
          player_1_id: game.players.player_1,
          player_2_id: game.players.player_2,
        },
      });
      console.log("Created GameHeader gameId: " + createdGameHeader.game_id);
      // console.log(createdGameHeader);
    }

    //If both players haven't checked in, just let the socket handle it
    res.json({
      gameFound: true,
    });
  } else {
    // console.log("no game found with player ", client_id);
    //other player could have ran, response needs to communicate this
    res.json({
      gameFound: false,
    });
  }
});

function registerGameControllerHandlers(io, socket) {
  //CONSIDER HOW AUTH SHOULD BE DONE
  //authorize the user on connection with middleware
  //authorize the payload against the rights given by the jwt sent before each round

  const register = (session_id) => {
    socket.join(session_id);
    const numSocketsInRoom = socket.adapter.rooms.get(session_id).size;
    console.log(
      "Socket Registered on Room: " + session_id + " Size: " + numSocketsInRoom
    );
    console.log(numSocketsInRoom);
    if (numSocketsInRoom == 2) {
      socket.to(session_id).emit("test", "dick");
    }
  };

  socket.on("register", register);
}

function createPotentialGame(roster) {
  const potentialGame = {
    ...roster,
    checkInStatus: {
      player_1: false,
      player_2: false,
    },
  };
  // console.log(potentialGame);
  return potentialGame;
}

function isPlayer1(game, client_id) {
  return game.players.player_1 == client_id;
}

function findGameWithPlayer(session_id, client_id) {
  const game = activeGames.find((value) => {
    // console.log("value ", value);
    // console.log("session_id ", session_id);
    return value.rosterId == session_id;
  });
  // console.log(game);
  if (!game) return false;
  if (
    game.players.player_1 == client_id ||
    game.players.player_2 == client_id
  ) {
    return game;
  } else return false;
}

module.exports = { router, registerGameControllerHandlers };
