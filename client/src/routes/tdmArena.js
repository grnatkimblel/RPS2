import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import p5 from "p5";
import useSocket from "../hooks/useSocket";

/*
gameInfo:
    sessionId: roster.rosterId,
    roundStartTime: roundStartTime,
    player1: {
      username: '',
      userId: '',
      emoji: ''
    },
    player2: {
      username: '',
      userId: '',
      emoji: ''
    }

userInfo:
const [userInfo, setUserInfo] = useState({
  username: "",
  userId: "",
  emoji: "",
});

gameHeader : {
  game_id: 
  winner: 
  loser:
  player_1_id
  player_2
}

*/

function TDMArena({
  authHelper,
  navigate,
  userInfo, //client information
  gameInfo, //game connection info, received from matchmaking service
  gameInfoSetter, //needed to reset when user runs or game ends
  refreshToken,
}) {
  const p5Ref = useRef();
  const socket = useSocket(refreshToken, true);
  const TICKRATE_DIVISOR = 6;
  const CLIENT_FRAMERATE = 60;
  //this will need to change
  const PLAYER_NUMBER =
    gameInfo.player1.username == userInfo.username ? "player_1" : "player_2";

  const WIDTH = 1000;
  const HEIGHT = 945;
  let spawnPoints = [
    { x: (WIDTH / 10) * 2, y: (HEIGHT / 10) * 2 },
    { x: (WIDTH / 10) * 3, y: (HEIGHT / 10) * 2 },
    { x: (WIDTH / 10) * 4, y: (HEIGHT / 10) * 2 },
    { x: (WIDTH / 10) * 5, y: (HEIGHT / 10) * 2 },
    { x: (WIDTH / 10) * 6, y: (HEIGHT / 10) * 2 },
    { x: (WIDTH / 10) * 7, y: (HEIGHT / 10) * 2 },
  ];
  let playerPositions = {
    player_1: null,
    player_2: null,
    player_3: null,
    player_4: null,
    player_5: null,
    player_6: null,
  };
  const Sketch = (p) => {
    let players = Object.keys(playerPositions);
    players.forEach((player, index) => {
      playerPositions[player] = spawnPoints[index];
    });

    let tickCount = 0;
    let inputQueue = [];
    let emptyInput = { up: false, down: false, left: false, right: false };
    let currentInput = {};
    let isInputThisPacket = false;
    Object.assign(currentInput, emptyInput);

    function areInputsSame(Input1, Input2) {
      for (const key in Input1) {
        // console.log(key);
        // console.log(Input1[key]);
        // console.log(Input2[key]);

        if (Input1[key] != Input2[key]) {
          return false;
        }
      }
      return true;
    }

    function addInputToQueue(currentInput, tickCount) {
      inputQueue.push({ ...currentInput }); //add current input to queue

      if (!areInputsSame(currentInput, emptyInput)) {
        //update flag to send this whole queue if any of the values are set
        isInputThisPacket = true;
      }

      // console.log(areInputsSame(currentInput, emptyInput));
      // console.log(isInputThisPacket);
      Object.assign(currentInput, emptyInput); //reset the value of the current Input for the next tick

      if (tickCount % TICKRATE_DIVISOR == 0) {
        //if its time to send the queue
        if (isInputThisPacket) {
          //check that there is anything to send
          socket.emit("playerInput", gameInfo.sessionId, inputQueue);
          isInputThisPacket = false;
        }
        inputQueue = []; //reset the queue regardless so it doesnt grow huge
      }
    }

    p.setup = () => {
      p.createCanvas(WIDTH, HEIGHT);
    };

    p.draw = () => {
      // console.log("Framerate: ", p.millis() / (1000 * tickCount));
      tickCount += 1;
      p.background(0);
      p.fill(255);
      for (let player in playerPositions) {
        let position = playerPositions[player];
        p.rect(position.x, position.y, 50, 50);
      }
      if (p.keyIsDown(68)) {
        playerPositions[PLAYER_NUMBER].x += 1;
        currentInput = {
          ...currentInput,
          right: true,
        };
      }
      if (p.keyIsDown(65)) {
        playerPositions[PLAYER_NUMBER].x -= 1;
        currentInput = {
          ...currentInput,
          left: true,
        };
      }
      if (p.keyIsDown(87)) {
        playerPositions[PLAYER_NUMBER].y -= 1;
        currentInput = {
          ...currentInput,
          up: true,
        };
      }
      if (p.keyIsDown(83)) {
        playerPositions[PLAYER_NUMBER].y += 1;
        currentInput = {
          ...currentInput,
          down: true,
        };
      }
      addInputToQueue(currentInput, tickCount);
    };
  };

  useEffect(() => {
    const myP5 = new p5(Sketch, p5Ref.current);
    let unsubscribeSocket;
    console.log(
      "tdmArena UseEffect. socket.connected:",
      socket && socket.connected
    );

    if (socket && socket.connected) {
      console.log("subscribing");
      //subscribe to all events
      unsubscribeSocket = subscribeSocket(socket);
      socket.emit("tdm_register", gameInfo);
    }
    return () => {
      console.log("UseEffect Cleanup");
      myP5.remove();
      // setIsConnected(false);
      if (unsubscribeSocket != null) unsubscribeSocket();
    };
  }, [socket, socket?.connected]);

  function subscribeSocket(socket) {
    socket.on("startGame", (payload) => {
      console.log("GameStarted");
      console.log(payload);
    });
    socket.on("receiveGameState", (gameState) => {
      console.log(gameState);
      //map gamestate playerid's to player position entries and copy the positions from the server to the client
      Object.keys(gameState.players).forEach((player) => {
        //it is not straightforward to loop through the gameinfo's players. When you change that this will get less horrible
        if (player == gameInfo.player1.userId) {
          playerPositions.player_1 = gameState.players[player].position;
        } else {
          playerPositions.player_2 = gameState.players[player].position;
        }
      });
      console.log(playerPositions);
    });
    return () => {
      socket.off("startGame");
      socket.off("receiveGameState");
    };
  }

  return <div ref={p5Ref}></div>;
}

export default TDMArena;
