import authenticateToken from "../helper/authenticateToken.js";
import logger from "../utils/logger.js";

import express from "express";

import { getUsersByList } from "../helper/getUsers.js";
import db from "../models/index.js";
// Get the User model from the db object
const { GameHeader } = db;

const router = express.Router();
router.use(authenticateToken);
const COUNTDOWN_TIME = 3000;
/*

game = {
  rosterId: rosterId,
  players: [
    player1_id,
    player2_id,
],
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
  logger.info(" /quickdraw/pregame called successfully");
  const roster = req.body.roster;
  logger.info(roster);
  const players = roster.players;
  const fullPlayerInfo = await getUsersByList(players);
  // logger.info(fullPlayerInfo);
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

  if (!activeRooms.has(roster.rosterId)) {
    //countdown time is created when the room is added, all other players will get the exact same time
    const roundStartTime = Date.now() + COUNTDOWN_TIME;
    activeRooms.set(roster.rosterId, createPotentialGame(roster, roundStartTime));
  }

  res.json({
    sessionId: roster.rosterId,
    roundStartTime: activeRooms.get(roster.rosterId).roundStartTime,
    player1: player_1_info,
    player2: player_2_info,
  });
});

router.post("/quickdraw/run", async (req, res) => {
  const client_id = req.authUser.id;
  const session_id = req.body.session_id;

  // if (activeRooms.has(session_id)) {
  //   activeRooms.delete(session_id);

  //   logger.info("game removed");
  //   logger.info("activeRooms after removal:");
  //   logger.info(activeRooms);
  // } else {
  //   //game doesn't exist or other player already ran
  //   //do nothing
  // }
  res.sendStatus(200);
});

router.post("/quickdraw/startGame", async (req, res) => {
  //Both clients must call this api before any actions are taken
  const session_id = req.body.session_id;
  const client_id = req.authUser.id;
  logger.info("startGame called");
  if (activeRooms.has(session_id)) {
    let game = activeRooms.get(session_id);
    if (game.players.player_1 == client_id) {
      game.checkInStatus.player_1 = true;
    } else {
      game.checkInStatus.player_2 = true;
    }
    logger.info("checkInStatus");
    logger.info(game.checkInStatus);
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
      logger.info("Created GameHeader gameId: " + createdGameHeader.game_id);
      // logger.info(createdGameHeader);
    }

    //If both players haven't checked in, just let the socket handle it
    res.json({
      gameFound: true,
    });
  } else {
    // logger.info("no game found with player ", client_id);
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
  isFinished: false
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
    logger.info("gameInfo: ");
    logger.info(gameInfo);
    const session_id = gameInfo.sessionId;
    socket.join(session_id);
    const numSocketsInRoom = socket.adapter.rooms.get(session_id).size;
    logger.info(
      "Socket " + socket.authUser.username + " Registered on Room: " + session_id + " Size: " + numSocketsInRoom
    );

    if (numSocketsInRoom == 2) {
      io.to(session_id).emit("test", "   Room Full");
      logger.info("doGame Called");
      doGame(io, gameInfo);
    }
  };

  const playHand = (sessionId, hand) => {
    const debug = false;
    let hands;
    let client_id = socket.client_id;
    // if (debug) {
    logger.info(client_id + " played a hand");
    // }
    let game = activeRooms.get(sessionId);
    let isPlayer_1 = game.players.player_1 == client_id;
    // game = activeRooms.get(sessionId);
    let thisRound = game.rounds[game.rounds.length - 1];
    let now = Date.now();
    // logger.info("game");
    // logger.info(game);

    if (now < thisRound.readyTime) {
      logger.info("hand played before ready time, this should be impossible");
    }
    if (now > thisRound.readyTime && now < thisRound.drawTime) {
      //the player has played their hand to early
      logger.info("the player has played their hand to early");
      io.to(sessionId).emit("ReceiveHand", isPlayer_1, "tooEarly");
    }
    if (now > thisRound.drawTime && now < thisRound.endTime) {
      //this is a valid play
      logger.info("this is a valid play");
      if (debug) {
        logger.info("before hands");
        logger.info(thisRound.hands);
      }
      thisRound.hands = {
        ...thisRound.hands,
        player_1: isPlayer_1
          ? {
              client_id: client_id,
              hand: hand,
              time: now,
            }
          : thisRound.hands.player_1,
        player_2: isPlayer_1
          ? thisRound.hands.player_2
          : {
              client_id: client_id,
              hand: hand,
              time: now,
            },
      };
      io.to(sessionId).emit("ReceiveHand", isPlayer_1, hand);

      let temp = activeRooms.get(sessionId);
      if (debug) {
        logger.info("after hands");
        logger.info(temp.rounds[temp.rounds.length - 1].hands);

        logger.info("after room");
        logger.info(temp);
      }
      return;
    }
    if (now > thisRound.endTime) {
      //the player has played their hand to late
      logger.info("the player has played their hand to late");
    }
    if (debug) {
      logger.info("before hands");
      logger.info(thisRound.hands);
    }
    thisRound.hands = {
      ...thisRound.hands,
      player_1: isPlayer_1
        ? {
            client_id: client_id,
            hand: null,
            time: null,
          }
        : thisRound.hands.player_1,
      player_2: isPlayer_1
        ? thisRound.hands.player_2
        : {
            client_id: client_id,
            hand: null,
            time: null,
          },
    };

    if (debug) {
      room = activeRooms.get(sessionId);
      logger.info("after hands");
      logger.info(room.hands);

      logger.info("after room");
      logger.info(room);
    }
  };

  const run = (session_id) => {
    activeRooms.get(session_id).isFinished = true;
    io.to(session_id).emit("PlayerRan");
  };

  socket.on("quickdraw_run", run);
  socket.on("quickdraw_register", register);
  socket.on("quickdraw_playHand", playHand);
}

async function doGame(io, gameInfo) {
  while (!activeRooms.get(gameInfo.sessionId).isFinished) {
    logger.info("doRound Called");
    await doRound(io, gameInfo);
  }
}

async function doRound(io, gameInfo) {
  return new Promise((resolve, reject) => {
    const session_id = gameInfo.sessionId;
    let drawTime = Math.random() * 8 + 3;
    let endTime = Math.random() * 3 + 3 + drawTime;
    // logger.info("readyDelaySeconds: " + readyDelaySeconds);
    // logger.info("drawDelaySeconds: " + drawDelaySeconds);
    logger.info("emitting BeginReadyPhase");
    io.to(session_id).emit("BeginReadyPhase", drawTime);
    let now = Date.now();

    //##TODO create a more complete object to store in active Rooms. may need player 1 and player two, gotta get them somehow
    let game = activeRooms.get(session_id);
    game.rounds.push({
      roundNumber: game.rounds.length + 1,
      readyTime: now,
      drawTime: now + drawTime * 1000,
      endTime: now + endTime * 1000,
      hands: {
        player_1: {
          client_id: gameInfo.player1.userId,
          hand: null,
          time: null,
        },
        player_2: {
          client_id: gameInfo.player2.userId,
          hand: null,
          time: null,
        },
      },
    });

    setTimeout(() => {
      io.to(session_id).emit("BeginDrawPhase");
    }, drawTime * 1000);
    setTimeout(() => {
      io.to(session_id).emit("BeginEndPhase");
      if (!game.isFinished) updateGameStateAfterRound(io, gameInfo);
      io.to(session_id).emit("ReceiveNewGameState", activeRooms.get(session_id));
    }, endTime * 1000);
    setTimeout(() => {
      if (activeRooms.get(session_id).isFinished) io.to(session_id).emit("EndGame");
      resolve();
    }, (endTime + 3) * 1000);
  });
}

function updateGameStateAfterRound(io, gameInfo) {
  const session_id = gameInfo.sessionId;
  let game = activeRooms.get(session_id);
  let p1Score = 0;
  let p2Score = 0;
  let p1CBM = 0;
  let p2CBM = 0;
  // get current score
  logger.info(" ");
  logger.info("gamr");
  logger.info(game);
  logger.info("RoundScoring");
  game.rounds.forEach((round) => {
    let hands = round.hands;
    logger.info("round");
    logger.info(round);
    logger.info("hands");
    logger.info(hands);
    logger.info("didScoring(hands)");
    logger.info(didScoring(hands));
    if (didScoring(hands)) {
      logger.info("didPlayer1Win(hands.player_1.hand, hands.player_2.hand)");
      logger.info(didPlayer1Win(hands.player_1.hand, hands.player_2.hand));
    }
    if (didHands(hands)) {
      didPlayer1GetCBM(hands.player_1.time, hands.player_2.time)
        ? p1CBM < 3
          ? (p1CBM += 1)
          : void 0
        : p2CBM < 3
        ? (p2CBM += 1)
        : void 0;
      if (didScoring(hands)) {
        didPlayer1Win(hands.player_1.hand, hands.player_2.hand) ? (p1Score += 1) : (p2Score += 1);
      }
    }
  });
  //update score
  game.header = {
    ...game.header,
    player_1_score: p1Score,
    player_2_score: p2Score,
    player_1_CBM: p1CBM,
    player_2_CBM: p2CBM,
  };
  //check if game is over
  if (
    game.header.player_1_score == game.header.numRoundsToWin ||
    game.header.player_2_score == game.header.numRoundsToWin
  )
    game.isFinished = true;
}

function didScoring(hands) {
  //was it not a tie
  let p1Hand = hands.player_1.hand;
  let p2Hand = hands.player_2.hand;
  return p1Hand != p2Hand;
}

function didHands(hands) {
  //did anyone actually play
  let p1Hand = hands.player_1.hand;
  let p2Hand = hands.player_2.hand;
  return p1Hand != null || p2Hand != null;
}

function didPlayer1Win(p1Hand, p2Hand) {
  if (p1Hand == null) {
    return false;
  }
  if (p2Hand == null) {
    return true;
  }
  if (p1Hand == "rock") {
    return p2Hand == "scissors" ? true : false;
  }
  if (p1Hand == "paper") {
    return p2Hand == "rock" ? true : false;
  }
  if (p1Hand == "scissors") {
    return p2Hand == "paper" ? true : false;
  }
}

function didPlayer1GetCBM(p1HandTime, p2HandTime) {
  if (p1HandTime != null && p2HandTime != null) {
    return p1HandTime > p2HandTime;
  }
  return p2HandTime == null ? true : false;
}

function createPotentialGame(roster, roundStartTime) {
  let potentialGame = {
    roundStartTime: roundStartTime,
    isFinished: false,
    players: {
      player_1: roster.players[0],
      player_2: roster.players[1],
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

  //logger.info(shellObject);
  return potentialGame;
}

export { router, registerGameControllerHandlers };
