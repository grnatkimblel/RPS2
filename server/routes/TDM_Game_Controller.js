import authenticateToken from "../helper/authenticateToken.js";
import logger from "../utils/logger.js";
import updateGameState from "../shared/updateGameState.js";
import { getUsersByList } from "../helper/getUsers.js";

import express from "express";
const router = express.Router();

router.use(authenticateToken);

//maps sessionId's to GameState objects
let activeRooms = new Map();
//maps sessionId's to InputQueues
let inputQueue = new Map();

let gameTicksSoFar = 0;
let setTimeoutsCalled = 0;
let setImmediatesCalled = 0;
let previousTick;
const COUNTDOWN_TIME = 7;
const GAME_TICKS_LENGTH = 100; //in ms
const GAME_TIME_LIMIT = 180;
const hands = {
  ROCK: "rock",
  PAPER: "paper",
  SCISSORS: "scissors",
};

//prob need to make a map object
const mapSizes = [{ w: 1000, h: 945 }];
/*
Lets describe the Game State
GameState:
    Round State:
        Score: int
        EndTime: int (ms since 1980)

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
            position: {x,y}
            - x,y coordinates in the bounds of the map size
            team: int
            - MAYBE more than 2 teams but super unlikely, mostly just to future proof
            isMobile: Bool
            - All players are either able to move, or are unable to move
            - Players are stunned when they tie for example
*/

//this is about populating screens before the sockets get involved
router.post("/tdm/pregame", async (req, res) => {
  logger.info(" /tdm/pregame called successfully");
  const roster = req.body.roster;
  // logger.info(roster);
  const players = roster.players;
  const fullPlayerInfo = await getUsersByList(players);
  // logger.info(fullPlayerInfo);
  const sanitizedPlayerInfo = fullPlayerInfo.map((playerInfo) => {
    return {
      username: playerInfo.username,
      userId: playerInfo.id,
      emoji: playerInfo.player_emoji,
    };
  });

  res.json({
    sessionId: roster.rosterId,
    players: sanitizedPlayerInfo,
  });
});

//this is about ensuring all players have socket connections before starting the game
function registerGameControllerHandlers(io, socket) {
  socket.on("tdm_register", (gameInfo) => {
    // logger.info("gameInfo: ");
    // logger.info(gameInfo);
    const session_id = gameInfo.sessionId;
    socket.join(session_id);
    const numSocketsInRoom = socket.adapter.rooms.get(session_id).size;
    logger.info(
      "Socket " + socket.authUser.username + " Registered on Room: " + session_id + " Size: " + numSocketsInRoom
    );
    if (numSocketsInRoom == 4) {
      if (!activeRooms.has(session_id)) {
        const gameStartTime = Date.now() + COUNTDOWN_TIME;
        activeRooms.set(session_id, createNewGameState(gameInfo, gameStartTime));
      }
      io.to(session_id).emit("test", "   Room Full");
      logger.info("starting TDM");
      io.to(session_id).emit("startGame", activeRooms.get(session_id));
      previousTick = Date.now();
      gameLoop(io, gameInfo);
    }
  });

  socket.on("playerInput", (session_id, packet) => {
    let client_id = socket.client_id;
    let inputToPush = {
      userId: client_id,
      packetId: packet.packetId,
      inputs: packet.inputQueue,
      currentTime: Date.now(),
    };
    let currentQueue;
    if (inputQueue.has(session_id)) {
      currentQueue = inputQueue.get(session_id);
      currentQueue.push(inputToPush);
    } else {
      currentQueue = [inputToPush];
    }
    inputQueue.set(session_id, currentQueue);
    // logger.info("");
    // logger.info(inputQueue.get(session_id));
  });
}

//Credit to alex@timetocode.com
//https://github.com/timetocode/node-game-loop/blob/master/gameLoop.js

function gameLoop(io, gameInfo) {
  let now = Date.now();
  gameTicksSoFar += 1;

  if (previousTick + GAME_TICKS_LENGTH <= now) {
    let delta = (now - previousTick) / 1000;
    previousTick = now;
    doGameTick(io, gameInfo);
    // logger.info(
    //   "delta",
    //   delta,
    //   "(target: " + GAME_TICKS_LENGTH + " ms)",
    //   "node ticks",
    //   gameTicksSoFar,
    //   "setTimeoutCalled",
    //   setTimeoutsCalled,
    //   "setImmediateCalled",
    //   setImmediatesCalled
    // );
    /*
    this is mad accurate, takes 20000 calls to execute on time tho. Im just trusting that dude
    SetTimeout is called around 70-80 times, setImmediate is called the other 20,000+. Rarely its below 10k tho.
    */
    gameTicksSoFar = 0;
    setTimeoutsCalled = 0;
    setImmediatesCalled = 0;
  }

  if (Date.now() - previousTick < GAME_TICKS_LENGTH - 16) {
    setTimeoutsCalled += 1;
    setTimeout(() => {
      gameLoop(io, gameInfo);
    });
  } else {
    setImmediatesCalled += 1;
    setImmediate(() => {
      gameLoop(io, gameInfo);
    });
  }
}

function doGameTick(io, gameInfo) {
  // logger.info("gameInfo");
  // logger.info(gameInfo);
  // logger.info("inputQueue");
  // logger.info(inputQueue);
  const session_id = gameInfo.sessionId;
  let sessionGameState = activeRooms.get(session_id);
  let sessionInputQueue = inputQueue.get(session_id);
  //flatten inputs into a single array
  if (sessionInputQueue) {
    let flatInputArray = [];
    let acknowledgedPacketIds = [];
    sessionInputQueue.forEach((packet) => {
      // logger.info(packet);
      acknowledgedPacketIds.push(packet.packetId);
      const packetLength = packet.inputs.length;
      packet.inputs.forEach((input, index) => {
        let gameInput = { ...input };
        gameInput.userId = packet.userId;
        gameInput.timestamp = Math.floor(packet.currentTime - (packetLength - (index + 1)) * 16.667);
        flatInputArray.push(gameInput);
      });
    });
    if (flatInputArray.length > 0) {
      flatInputArray.sort((a, b) => b.timestamp - a.timestamp); //we want these sorted greatest to least so we can pop() from the end of the array into the update fn
      while (flatInputArray.length > 0) {
        //add the list of packetId's outside the update to keep it clean
        sessionGameState = updateGameState(sessionGameState, flatInputArray.pop());
      }
      // logger.info("acknowledging: ");
      // logger.info(acknowledgedPacketIds);
      // logger.info("sessionGameState: ");
      // logger.info(sessionGameState);
      activeRooms.set(session_id, sessionGameState); //comment out to test reconciliation
      io.to(session_id).emit("receiveGameState", sessionGameState, acknowledgedPacketIds); // send the gamestate and list of acknowledged packets
    }
    // logger.info(flatInputArray);
    // Object.keys(sessionGameState.players).forEach((player) =>
    //   logger.info(sessionGameState.players[player].position)
    // );
  }
  //sort all input in time
  //eventually sort inputs taking into consideration the time between inputs allowing users to have inputs weaving through packets
  // logger.info(sessionInputQueue);
  inputQueue.delete(session_id);
}

//hacked together from quickdraw matchmaking
function createNewGameState(gameInfo, gameStartTime) {
  // console.log("mapSizes");
  // console.log(mapSizes);
  console.log("gameInfo");
  console.log(gameInfo);
  let playerList = [];
  let playerGameStates = {};
  playerList.push(...gameInfo.players);
  logger.info(playerList);

  playerList.forEach((player, index) => {
    playerGameStates[player.userId] = {
      id: player.userId,
      isAlive: true,
      hand: hands.ROCK,
      spawnTime: gameStartTime,
      spawnPoint: {
        x: (mapSizes[0].w / 10) * (index + 2),
        y: (mapSizes[0].h / 10) * 2,
      },
      position: {
        x: (mapSizes[0].w / 10) * (index + 2),
        y: (mapSizes[0].h / 10) * 2,
      },
      team: index % 2,
      isMobile: true,
      score: 0,
    };
  });

  // console.log("playerGameStates");
  // console.log(playerGameStates);
  let newGameState = {
    gameStartTime: gameStartTime,
    mapSize: { x: 1000, y: 945 },
    isFinished: false,
    players: playerGameStates,
    round: {
      team_1_score: 0,
      team_2_score: 0,
      gameEndTime: Date.now() + GAME_TIME_LIMIT * 1000,
    },
  };

  return newGameState;
}

export { router, registerGameControllerHandlers };
