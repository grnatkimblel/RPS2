import authenticateToken from "../helper/authenticateToken.js";
import logger from "../utils/logger.js";

import express from "express";
const router = express.Router();

router.use(authenticateToken);

//maps sessionId's to GameState objects
let activeRooms = new Map();

const GAME_TIME_LIMIT = 180;
const hands = {
  ROCK: "rock",
  PAPER: "paper",
  SCISSORS: "scissors",
};

//prob need to make a map object
const mapSizes = [(1000, 945)];
/*
Lets describe the Game State
GameState:
    Round State:
        Score: int
        TimeLeft: int (ms since 1980)

    Map State:
        Size: (x,y) tuple
        Spawnpoints: [(x,y)...] array of tuple

    Players: [PlayerState...] array of PlayerState
        PlayerState:
            id: string
            isAlive: Bool
            - After dying players may be unable to respawn for a period of time
            hand: Enum
            - All players are either Rock, Paper, or Scissors
            position: (x,y) tuple
            - x,y coordinates in the bounds of the map size
            team: int
            - MAYBE more than 2 teams but super unlikely, mostly just to future proof
            isMobile: Bool
            - All players are either able to move, or are unable to move
            - Players are stunned when they tie for example
*/

function registerGameControllerHandlers(io, socket) {
  socket.on("tdm_register", (gameInfo) => {
    logger.info("gameInfo: ");
    logger.info(gameInfo);
    const session_id = gameInfo.sessionId;
    socket.join(session_id);
    const numSocketsInRoom = socket.adapter.rooms.get(session_id).size;
    logger.info(
      "Socket " +
        socket.authUser.username +
        " Registered on Room: " +
        session_id +
        " Size: " +
        numSocketsInRoom
    );
    if (numSocketsInRoom == 2) {
      //temp
      if (!activeRooms.has(session_id))
        activeRooms.set(session_id, createNewGameState(gameInfo));
      io.to(session_id).emit("test", "   Room Full");
      logger.info("starting TDM");
      io.to(session_id).emit("startGame", activeRooms.get(session_id));
    }
  });
}

//hacked together from quickdraw matchmaking
function createNewGameState(gameInfo) {
  let playerList = [];
  let playerGameStates = Map();
  playerList.append(gameInfo.player1.userId);
  playerList.append(gameInfo.player2.userId);

  playerList.forEach((playerId, index) => {
    playerGameStates.set(playerId, {
      id: playerId,
      isAlive: true,
      hand: hands.ROCK,
      position: {
        x: (mapSizes[0][0] / 10) * index + 1,
        y: (mapSizes[0][1] / 10) * index,
      },
      team: index,
      isMobile: true,
    });
  });

  newGameState = {
    isFinished: false,
    players: playerGameStates,
    round: {
      player_1_score: 0,
      player_2_score: 0,
      gameEndTime: Date.now() + GAME_TIME_LIMIT * 1000,
    },
  };

  //logger.info(shellObject);
  return newGameState;
}
