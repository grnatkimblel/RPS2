import authenticateToken from "../helper/authenticateToken.js";
import logger from "../utils/logger.js";

import express from "express";

import { getUsersByList } from "../helper/getUsers.js";
import db from "../models/index.js";

const { QuickdrawGameHeader, QuickdrawRound, QuickdrawAction } = db.models;

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

QuickdrawGameHeader : {
  game_id: 
  winner: 
  loser:
  player_1_id
  player_2
}

*/

let activeRooms = new Map();

//there needs to be some validation to ensure that the client is not sending a roster that hasnt been matchmade by the matchmaking service
//Maybe sign rosters with a jwt and validate here. The roster can be in the body of the jwt.
router.post("/quickdraw/pregame", async (req, res) => {
  logger.info(" /quickdraw/pregame called successfully");
  const roster = req.body.roster;
  const game_type = req.body.game_type;
  logger.info(activeRooms);
  logger.info(roster);
  logger.info(game_type);
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
    const gameStartTime = Date.now() + COUNTDOWN_TIME;
    activeRooms.set(roster.rosterId, createPotentialGame(roster, gameStartTime, game_type));
  }

  res.json({
    sessionId: roster.rosterId,
    gameStartTime: activeRooms.get(roster.rosterId).gameStartTime,
    gameType: game_type,
    player1: player_1_info,
    player2: player_2_info,
  });
});

// router.post("/quickdraw/run", async (req, res) => {
//   const client_id = req.authUser.id;
//   const session_id = req.body.session_id;

//   // if (activeRooms.has(session_id)) {
//   //   activeRooms.delete(session_id);

//   //   logger.info("game removed");
//   //   logger.info("activeRooms after removal:");
//   //   logger.info(activeRooms);
//   // } else {
//   //   //game doesn't exist or other player already ran
//   //   //do nothing
//   // }
//   res.sendStatus(200);
// });

router.post("/quickdraw/startGame", async (req, res) => {
  //Both clients must call this api before any actions are taken
  //If a player has run before the countdown ends, the game wont be found in active Rooms
  //the rarest of edge cases may exist. The player 2 could run in between player 1 sending and receiving their request. These calls are supposed to be sent in sync. While the client side timing bug is present this is still an issue.
  const session_id = req.body.session_id;
  logger.info("startGame called");
  res.json({
    gameFound: activeRooms.has(session_id),
  });
});

const GAME_PHASES = {
  START: "Start",
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
    startTime,
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
    const debug = true;
    let hands;
    let client_id = socket.client_id;
    // if (debug) {
    logger.info(client_id + " played a hand");
    logger.info("sessionId", sessionId);
    // }
    let game = activeRooms.get(sessionId);
    let isPlayer_1 = game.gameState.players.player_1 == client_id;
    // game = activeRooms.get(sessionId);
    let thisRound = game.gameState.rounds[game.gameState.rounds.length - 1];
    let now = Date.now();
    // logger.info("game");
    // logger.info(game);
    addHandToActions(client_id, game.actions, hand, thisRound.roundNumber, now);

    if (now < thisRound.startTime) {
      logger.info("hand played before start time, this should be impossible");
    }
    if (now > thisRound.startTime && now < thisRound.drawTime) {
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
        logger.info(temp.gameState.rounds[temp.gameState.rounds.length - 1].hands);

        logger.info("after room");
        logger.info(temp.gameState);
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
      logger.info("after hands");
      logger.info(thisRound.hands);

      logger.info("after room");
      logger.info(thisRound);
    }
  };

  const run = (session_id) => {
    //this is also called when the players leave the game after it ends. So there is only a need to set isFinished to true if someone left before the game ended. The gameEnd logic will delete the session if so
    if (activeRooms.has(session_id)) activeRooms.get(session_id).gameState.isFinished = true;
    io.to(session_id).emit("PlayerRan");
  };

  socket.on("quickdraw_run", run);
  socket.on("quickdraw_register", register);
  socket.on("quickdraw_playHand", playHand);
}

async function doGame(io, gameInfo) {
  let game = activeRooms.get(gameInfo.sessionId);
  while (!game.gameState.isFinished) {
    logger.info("doRound Called");
    await doRound(io, gameInfo);
  }
  if (isGameFinished(game)) {
    await writeGameToDB(game, gameInfo);
  }
  if (!activeRooms.delete(gameInfo.sessionId)) {
    throw Error("At time of gameEnd, Cannot remove room:", gameInfo.sessionId);
  }
}

async function doRound(io, gameInfo) {
  return new Promise((resolve, reject) => {
    const session_id = gameInfo.sessionId;
    let drawTime = Math.random() * 8 + 3;
    let endTime = Math.random() * 3 + 3 + drawTime;

    logger.info("emitting BeginStartPhase");
    io.to(session_id).emit("BeginStartPhase", drawTime);
    let now = Date.now();

    //##TODO create a more complete object to store in active Rooms. may need player 1 and player two, gotta get them somehow
    let game = activeRooms.get(session_id);
    game.gameState.rounds.push({
      roundNumber: game.gameState.rounds.length + 1,
      startTime: now,
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
    logger.info(game);

    setTimeout(() => {
      io.to(session_id).emit("BeginDrawPhase");
    }, drawTime * 1000);
    setTimeout(() => {
      io.to(session_id).emit("BeginEndPhase");
      if (!game.gameState.isFinished) updateGameStateAfterRound(io, gameInfo);
      io.to(session_id).emit("ReceiveNewGameState", activeRooms.get(session_id));
    }, endTime * 1000);
    setTimeout(() => {
      if (game.gameState.isFinished) io.to(session_id).emit("EndGame");
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
  game.gameState.rounds.forEach((round) => {
    let hands = round.hands;
    let p1Hand = hands.player_1.hand;
    let p2Hand = hands.player_2.hand;
    if (didSomeonePlayAHand(p1Hand, p2Hand)) {
      if (didPlayer1GetCBM((hands.player_1.time, hands.player_2.time))) {
        //need to add new CBM logic
      }
      if (isNotATie(p1Hand, p2Hand)) {
        didPlayer1WinRound(p1Hand, p2Hand) ? (p1Score += 1) : (p2Score += 1);
      }
    }
  });

  //update score
  game.gameState.header = {
    ...game.gameState.header,
    player_1_score: p1Score,
    player_2_score: p2Score,
    player_1_CBM: p1CBM,
    player_2_CBM: p2CBM,
  };

  //check if game is over
  if (isGameFinished(game)) game.gameState.isFinished = true;
}

function isGameFinished(game) {
  return (
    game.gameState.header.player_1_score == game.gameState.header.numRoundsToWin ||
    game.gameState.header.player_2_score == game.gameState.header.numRoundsToWin
  );
}

function didPlayer1WinGame(game) {
  return game.gameState.header.player_1_score == game.gameState.header.numRoundsToWin;
}

function isNotATie(p1Hand, p2Hand) {
  return p1Hand != p2Hand;
}

function didSomeonePlayAHand(p1Hand, p2Hand) {
  return p1Hand != null || p2Hand != null;
}

function didPlayer1WinRound(p1Hand, p2Hand) {
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

function createPotentialGame(roster, gameStartTime, gameType) {
  let potentialGame = {
    checkInStatus: {
      player_1: false,
      player_2: false,
    },
    actions: [
      // {
      //   game_id: ,
      //   round_id: ,
      //   player_id: ,
      //   action_type: ,
      //   action_value: ,
      //   timestamp: ,
      // },
    ],
    gameStartTime: gameStartTime,
    gameState: {
      isFinished: false,
      players: {
        player_1: roster.players[0],
        player_2: roster.players[1],
      },
      header: {
        gameType: gameType,
        numRoundsToWin: 3,
        player_1_score: 0,
        player_2_score: 0,
        player_1_CBM: 0,
        player_2_CBM: 0,
      },
      rounds: [
        //   {
        //   roundNumber
        //   startTime,
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
    },
  };

  //logger.info(shellObject);
  return potentialGame;
}

function addHandToActions(player_id, actionsArray, hand, roundNumber, now) {
  actionsArray.push({
    // game_id: ,
    round_id: roundNumber,
    player_id: player_id,
    action_type: "Play Hand", //this will need to be updated
    action_value: hand,
    timestamp: now,
  });
}

async function writeGameToDB(game, gameInfo) {
  let quickdrawRoundPromises = [];
  let quickdrawActionPromises = [];

  await QuickdrawGameHeader.create({
    game_id: gameInfo.sessionId,
    game_type: game.gameState.header.gameType,
    winner: didPlayer1WinGame(game) ? game.gameState.players.player_1 : game.gameState.players.player_2,
    loser: didPlayer1WinGame(game) ? game.gameState.players.player_2 : game.gameState.players.player_1,
    player_1_id: game.gameState.players.player_1,
    player_2_id: game.gameState.players.player_2,
  });

  game.gameState.rounds.forEach((round, index) => {
    quickdrawRoundPromises.push(
      QuickdrawRound.create({
        game_id: gameInfo.sessionId,
        round_id: round.roundNumber,
        winner: didPlayer1WinRound(round.hands.player_1.hand, round.hands.player_2.hand)
          ? game.gameState.players.player_1
          : game.gameState.players.player_2,
        player_1_final_hand: round.hands.player_1.hand,
        player_2_final_hand: round.hands.player_2.hand,
        round_start_time: round.startTime,
        round_draw_time: round.drawTime,
        round_end_time: round.endTime,
      })
    );
  });
  await Promise.all(quickdrawRoundPromises);

  game.actions.forEach((action) => {
    quickdrawActionPromises.push(
      QuickdrawAction.create({
        game_id: gameInfo.sessionId,
        round_id: action.round_id,
        player_id: action.player_id,
        action_type: "Play Hand",
        action_value: action.action_value,
        timestamp: action.timestamp,
      })
    );
  });
  await Promise.all(quickdrawActionPromises);
}

export { router, registerGameControllerHandlers };
