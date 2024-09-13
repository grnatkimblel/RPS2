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

  const WIDTH = 1000;
  const HEIGHT = 945;
  const Sketch = (p) => {
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

    let players = Object.keys(playerPositions);
    players.forEach((player, index) => {
      playerPositions[player] = spawnPoints[index];
    });

    p.setup = () => {
      p.createCanvas(WIDTH, HEIGHT);
    };

    p.draw = () => {
      p.background(0);
      p.fill(255);
      for (let player in playerPositions) {
        let position = playerPositions[player];
        p.rect(position.x, position.y, 50, 50);
      }
      if (p.keyIsDown(68)) {
        playerPositions["player_1"].x += 1;
      }
      if (p.keyIsDown(65)) {
        playerPositions["player_1"].x -= 1;
      }
      if (p.keyIsDown(87)) {
        playerPositions["player_1"].y -= 1;
      }
      if (p.keyIsDown(83)) {
        playerPositions["player_1"].y += 1;
      }
    };
  };

  useEffect(() => {
    const myP5 = new p5(Sketch, p5Ref.current);
    let unsubscribeSocket;
    if (socket && socket.connected) {
      //subscribe to all events
      unsubscribeSocket = subscribeSocket(socket);
    }
    return () => {
      myP5.remove();
      if (unsubscribeSocket != null) unsubscribeSocket();
    };
  }, [socket]);

  function subscribeSocket(socket) {
    socket.on("startGame", (payload) => {
      console.log("GameStarted");
      console.log("payload");
    });
    socket.on("receiveGameState", (gameState) => {});
    return () => {
      socket.off("receiveGameState");
    };
  }

  return <div ref={p5Ref}></div>;
}

export default TDMArena;
