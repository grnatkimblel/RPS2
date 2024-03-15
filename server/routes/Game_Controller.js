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
  },
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

let activeRooms = new Map();

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

  if (!activeRooms.has(roster.rosterId))
    activeRooms.set(roster.rosterId, createPotentialGame(roster));

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

  if (activeRooms.has(session_id)) {
    activeRooms.delete(session_id);

    console.log("game removed");
    console.log("activeRooms after removal:");
    console.log(activeRooms);
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
  if (activeRooms.has(session_id)) {
    game = activeRooms.get(session_id);
    if (game.players.player_1 == client_id) {
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

/*
activeRooms
key: session Id
value: {
  players: {
    player_1: client_id,
    player_2: client_id
  }
  header: {
    numRoundsToWin:
    player_1_score:
    player_2_score:
    player_1_CBM:
    player_2_CBM:
  }
  rounds: [{
    readyTime,
    drawTime,
    endTime,
    hands:
      player_1: {
        client_id, 
        hand: hand, 
        time: time
      },
      player_2: {
        client_id, 
        hand: hand, 
        time: time
      },
    
  },...]
  checkInStatus: {
    player_1: false,
    player_2: false,
  },
}
*/

function registerGameControllerHandlers(io, socket) {
  const register = (gameInfo) => {
    console.log("gameInfo: ");
    console.log(gameInfo);
    const session_id = gameInfo.sessionId;
    socket.join(session_id);
    const numSocketsInRoom = socket.adapter.rooms.get(session_id).size;
    console.log(
      "Socket " +
        socket.authUser.username +
        " Registered on Room: " +
        session_id +
        " Size: " +
        numSocketsInRoom
    );

    if (numSocketsInRoom == 2) {
      io.to(session_id).emit("test", "   Room Full");
      beginReadyPhase(io, gameInfo);
    }
  };

  const playHand = (client_id, sessionId, hand) => {
    const debug = false;
    // if (debug) {
    console.log(client_id + " played a hand");
    // }
    game = activeRooms.get(sessionId);
    isPlayer_1 = game.players.player_1 == client_id;
    game = activeRooms.get(sessionId);
    thisRound = game.rounds[game.rounds.length - 1];
    now = Date.now();
    // console.log("game");
    // console.log(game);

    if (now < thisRound.readyTime) {
      console.log("hand played before ready time, this should be impossible");
    }
    if (now > thisRound.readyTime && now < thisRound.drawTime) {
      //the player has played their hand to early
      console.log("the player has played their hand to early");
      io.to(sessionId).emit("ReceiveHand", isPlayer_1, "tooEarly");
    }
    if (now > thisRound.drawTime && now < thisRound.endTime) {
      //this is a valid play
      console.log("this is a valid play");
      hands = game.rounds[game.rounds.length - 1].hands;
      if (debug) {
        console.log("before hands");
        console.log(hands);
      }
      game.rounds[game.rounds.length - 1].hands = {
        ...game.rounds[game.rounds.length - 1].hands,
        player_1: isPlayer_1
          ? {
              client_id: client_id,
              hand: hand,
              time: now,
            }
          : game.rounds[game.rounds.length - 1].hands.player_1,
        player_2: isPlayer_1
          ? game.rounds[game.rounds.length - 1].hands.player_2
          : {
              client_id: client_id,
              hand: hand,
              time: now,
            },
      };
      io.to(sessionId).emit("ReceiveHand", isPlayer_1, hand);

      temp = activeRooms.get(sessionId);
      if (debug) {
        console.log("after hands");
        console.log(temp.rounds[temp.rounds.length - 1].hands);

        console.log("after room");
        console.log(temp);
      }
      return;
    }
    if (now > thisRound.endTime) {
      //the player has played their hand to late
      console.log("the player has played their hand to late");
    }
    hands = game.rounds[game.rounds.length - 1].hands;
    if (debug) {
      console.log("before hands");
      console.log(hands);
    }
    game.rounds[game.rounds.length - 1].hands = {
      ...game.rounds[game.rounds.length - 1].hands,
      player_1: isPlayer_1
        ? {
            client_id: client_id,
            hand: null,
            time: null,
          }
        : game.rounds[game.rounds.length - 1].hands.player_1,
      player_2: isPlayer_1
        ? game.rounds[game.rounds.length - 1].hands.player_2
        : {
            client_id: client_id,
            hand: null,
            time: null,
          },
    };

    if (debug) {
      console.log("after hands");
      console.log(hands);

      console.log("after room");
      console.log(activeRooms.get(sessionId));
    }
  };

  socket.on("register", register);
  socket.on("playHand", playHand);
}

function beginReadyPhase(io, gameInfo) {
  const session_id = gameInfo.sessionId;
  let drawTime = Math.random() * 8 + 3;
  let endTime = Math.random() * 3 + 3 + drawTime;
  // console.log("readyDelaySeconds: " + readyDelaySeconds);
  // console.log("drawDelaySeconds: " + drawDelaySeconds);
  io.to(session_id).emit("BeginReadyPhase", drawTime);
  now = Date.now();

  //##TODO create a more complete object to store in active Rooms. may need player 1 and player two, gotta get them somehow
  game = activeRooms.get(session_id);
  game.rounds.push({
    roundNumber: game.rounds.length + 1,
    readyTime: now,
    drawTime: now + drawTime * 1000,
    endTime: now + endTime * 1000,
    hands: {
      player_1: { client_id: gameInfo.player1.userId, hand: null, time: null },
      player_2: { client_id: gameInfo.player2.userId, hand: null, time: null },
    },
  });

  setTimeout(() => {
    io.to(session_id).emit("BeginDrawPhase");
  }, drawTime * 1000);
  setTimeout(() => {
    io.to(session_id).emit("BeginEndPhase");
  }, endTime * 1000);
}

function createPotentialGame(roster) {
  potentialGame = {
    players: {
      player_1: roster.players.player_1,
      player_2: roster.players.player_2,
    },
    header: {
      numRoundsToWin: 3,
      player_1_score: 0,
      player_2_score: 0,
      player_1_CBM: 0,
      player_2_CBM: 0,
    },
    rounds: [
      //   {
      //   readyTime,
      //   drawTime,
      //   endTime,
      //   hands: {
      //    player_1: {
      //      client_id:,
      //       hand:,
      //       time:,
      //    }
      //    player_2: {
      //      client_id:,
      //       hand:,
      //       time:,
      //    }
      //   }
      // }
    ],
    checkInStatus: {
      player_1: false,
      player_2: false,
    },
  };

  //console.log(shellObject);
  return potentialGame;
}

module.exports = { router, registerGameControllerHandlers };
