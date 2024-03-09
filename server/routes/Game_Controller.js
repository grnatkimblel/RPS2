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

const GAME_PHASES = {
  READY: "Ready",
  DRAW: "Draw",
  OVER: "Over",
};

let activeRooms = new Map();

/*
activeRooms
key: session Id
value: {
  numRoundsToWin:
  player_1_score:
  player_2_score:
  player_1_CBM:
  player_2_CBM:
  rounds: [{
    readyTime,
    drawTime,
    endTime,
    hands: [
      {player_1: client_id, hand: hand, time: time},
      {player_2: client_id, hand: hand, time: time},
    ]
  },...]
}
*/

function registerGameControllerHandlers(io, socket) {
  const register = (session_id) => {
    socket.join(session_id);
    const numSocketsInRoom = socket.adapter.rooms.get(session_id).size;
    console.log(
      "Socket Registered on Room: " + session_id + " Size: " + numSocketsInRoom
    );

    if (numSocketsInRoom == 2) {
      io.to(session_id).emit("test", "   Room Full");
      beginReadyPhase(io, session_id);
    }
  };

  const playHand = (client_id, session_id, hand) => {
    //if the hand is played during the valid time

    times = activeRooms.get(session_id);
    now = Date.now();
    readyTime = times[0];
    drawTime = times[1];
    endTime = times[2];

    if (now < readyTime) {
      console.log("hand played before ready time, this should be impossible");
    }
    if (now > readyTime && now < drawTime) {
      //the player has played their hand to early
      console.log("the player has played their hand to early");
    }
    if (now > drawTime && now < endTime) {
      //this is a valid play
      console.log("this is a valid play");
    }
    if (now > endTime) {
      //the player has played their hand to late
      console.log("the player has played their hand to late");
    }
    // console.log("client_id received: " + client_id);
    // console.log("session_id received: " + session_id);
    // console.log("hand received: " + hand);
    // console.log("times: " + times);
  };

  socket.on("register", register);
  socket.on("playHand", playHand);
}

function beginReadyPhase(io, session_id) {
  let drawTime = Math.random() * 8 + 3;
  let endTime = Math.random() * 3 + 3 + drawTime;
  // console.log("readyDelaySeconds: " + readyDelaySeconds);
  // console.log("drawDelaySeconds: " + drawDelaySeconds);
  io.to(session_id).emit("BeginReadyPhase", drawTime);
  now = Date.now();

  //##TODO create a more complete object to store in active Rooms. may need player 1 and player two, gotta get them somehow
  activeRooms.set(session_id, [
    now,
    now + drawTime * 1000,
    now + endTime * 1000,
  ]);

  setTimeout(() => {
    io.to(session_id).emit("BeginDrawPhase");
  }, drawTime * 1000);
  setTimeout(() => {
    io.to(session_id).emit("BeginEndPhase");
  }, endTime * 1000);
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
