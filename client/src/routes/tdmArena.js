import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";
import updateGameState from "../shared/updateGameState.js";

import { v4 as uuidv4 } from "uuid";
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
  const gameState = useRef();
  const clientSideReconciliationRef = useRef(null);
  const socket = useSocket(refreshToken, true);
  const [isInitialGamestateReceived, setIsInitialGamestateReceived] =
    useState(false);
  const TICKRATE_DIVISOR = 6;
  const CLIENT_FRAMERATE = 60;
  //this will need to change
  const PLAYER_NUMBER =
    gameInfo.player1.username == userInfo.username ? "player_1" : "player_2";

  const WIDTH = 1000;
  const HEIGHT = 945;
  const Sketch = (p) => {
    let tickCount = 0;
    let inputQueue = [];
    let unAcknowledgedGamestates = [];
    let isInputThisPacket = false;
    let emptyInput = {
      up: false,
      down: false,
      left: false,
      right: false,
      rock: false,
      paper: false,
      scissors: false,
    };
    let currentInput = {};
    Object.assign(currentInput, emptyInput);

    const PLAYER_HITBOX_SIZE = 45;
    const PLAYER_EMOJI_SIZE = 35;

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

    //for use in determining if the clients previous gamestate matches the result of the servers authoritative state
    function isGamestatesEqual(currentGamestate, targetGamestate) {
      let currentPlayerPosition =
        gameState.current.players[userInfo.userId].position;
      let targetPlayerPosition =
        targetGamestate.players[userInfo.userId].position;
      if (
        currentPlayerPosition.x == targetPlayerPosition.x &&
        currentPlayerPosition.y == targetPlayerPosition.y
      ) {
        return false;
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

      if (tickCount % TICKRATE_DIVISOR == 0) {
        //if its time to send the queue
        if (isInputThisPacket) {
          //check that there is anything to send

          const packetId = uuidv4();
          const packet = { packetId: packetId, inputQueue: inputQueue };
          socket.emit("playerInput", gameInfo.sessionId, packet);
          unAcknowledgedGamestates.push({
            gameState: JSON.parse(JSON.stringify(gameState.current)), //create a deep copy snapshot of the gamestate at this time, this is only accurate because client side prediction is enabled
            packet: packet,
          }); //store id of all packets sent so that they can be acknowledged when receiving the next gamestate
          isInputThisPacket = false;
        }
        inputQueue = []; //reset the queue regardless so it doesnt grow huge
      }
    }

    /*
    responsible for updating the gamestate prior to server confirmation
      - allows the client player to move instantly
    */
    function clientSidePrediction(currentInput) {
      //to reduce packet size, do not include userId in each input, instead add them on the fly.
      let inputWithId = { ...currentInput, userId: userInfo.userId };
      gameState.current = updateGameState(gameState.current, inputWithId);
    }

    clientSideReconciliationRef.current = (
      authoritativeGamestate,
      acknowledgedPacketIds
    ) => {
      //check each unAcknowledgedGamestate to see if its packets have been acknowledged by the server. Keep a reference to the latest gamestate that has been acknowledged.
      let latestAcknowledgedGamestateIndex;
      unAcknowledgedGamestates.forEach((tuple, i) => {
        if (acknowledgedPacketIds.includes(tuple.packet.packetId)) {
          latestAcknowledgedGamestateIndex = i;
        }
      }); // if the above is false, then the previous gamestate is the latest gamestate that has been acknowledged and is the one to check against the authorative gamestate
      //check that the gamestate represented by the acknowledged packets does not disagree with the current gamestate.

      console.log(unAcknowledgedGamestates.length);
      console.log(latestAcknowledgedGamestateIndex);
      console.log(unAcknowledgedGamestates[latestAcknowledgedGamestateIndex]);
      if (unAcknowledgedGamestates.length == 0) {
        //no input from user but still has received input
        gameState.current = authoritativeGamestate;
      } else {
        if (
          !isGamestatesEqual(
            unAcknowledgedGamestates[latestAcknowledgedGamestateIndex]
              .gameState,
            authoritativeGamestate
          )
        ) {
          //if it does, accept  the authoritativeGamestate as truth and replay packets and inputs since then.
          //you can use the packets stored and the current input queue to view all inputs between the acknowledged gamestate and the present.
          gameState.current = authoritativeGamestate;
          unAcknowledgedGamestates = unAcknowledgedGamestates.slice(
            latestAcknowledgedGamestateIndex + 1
          );
          //remove the acknowledged gamestate from the unacknowledged gamestate list
          unAcknowledgedGamestates.forEach((tuple) => {
            tuple.packet.inputQueue.forEach((input) => {
              gameState.current = updateGameState(gameState.current, {
                ...input,
                userId: userInfo.userId,
              });
            });
          });
          inputQueue.forEach((input) => {
            gameState.current = updateGameState(gameState.current, {
              ...input,
              userId: userInfo.userId,
            });
          });
          //when interpolation is implemented, be careful to make sure that the displayed state is different from the reference states.
          // -  a state with positions transitioning would never match the servers state
        }
      }
    };

    p.setup = () => {
      p.createCanvas(WIDTH, HEIGHT);
    };

    p.draw = () => {
      // console.log("Framerate: ", p.millis() / (1000 * tickCount));
      tickCount += 1;
      p.background(0);
      p.stroke(237, 50, 222); //hitbox color
      // console.log(gameState.current);
      for (let player of Object.keys(gameState.current.players)) {
        let currentPlayerState = gameState.current.players[player];
        let position = currentPlayerState.position;
        let playerHandEmoji =
          currentPlayerState.hand == "rock"
            ? "🗿"
            : currentPlayerState.hand == "paper"
            ? "📄"
            : currentPlayerState.hand == "scissors"
            ? "✂️"
            : "☣️";
        // console.log(position);
        p.circle(position.x, position.y, PLAYER_HITBOX_SIZE);
        p.textSize(PLAYER_EMOJI_SIZE);
        p.text(playerHandEmoji, position.x - 23, position.y + 12); //align text with hitbox
      }
      if (p.keyIsDown(68)) {
        // playerPositions[PLAYER_NUMBER].x += 1;
        currentInput = {
          ...currentInput,
          right: true,
        };
      }
      if (p.keyIsDown(65)) {
        // playerPositions[PLAYER_NUMBER].x -= 1;
        currentInput = {
          ...currentInput,
          left: true,
        };
      }
      if (p.keyIsDown(87)) {
        // playerPositions[PLAYER_NUMBER].y -= 1;
        currentInput = {
          ...currentInput,
          up: true,
        };
      }
      if (p.keyIsDown(83)) {
        // playerPositions[PLAYER_NUMBER].y += 1;
        currentInput = {
          ...currentInput,
          down: true,
        };
      }
      if (p.keyIsDown(p.LEFT_ARROW)) {
        // playerPositions[PLAYER_NUMBER].y += 1;
        currentInput = {
          ...currentInput,
          rock: true,
        };
      }
      if (p.keyIsDown(p.UP_ARROW)) {
        // playerPositions[PLAYER_NUMBER].y += 1;
        currentInput = {
          ...currentInput,
          paper: true,
        };
      }
      if (p.keyIsDown(p.RIGHT_ARROW)) {
        // playerPositions[PLAYER_NUMBER].y += 1;
        currentInput = {
          ...currentInput,
          scissors: true,
        };
      }
      clientSidePrediction(currentInput); //must occur first to provide a post input gamestate to unAcknowledgedGamestates
      addInputToQueue(currentInput, tickCount);
      Object.assign(currentInput, emptyInput); //reset the value of the current Input for the next tick
    };
  };

  useEffect(() => {
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
      // setIsConnected(false);
      if (unsubscribeSocket != null) unsubscribeSocket();
    };
  }, [socket, socket?.connected]);

  useEffect(() => {
    let myP5;
    if (isInitialGamestateReceived) {
      myP5 = new p5(Sketch, p5Ref.current);
    }
    return () => {
      if (myP5) {
        myP5.remove();
      }
    };
  }, [isInitialGamestateReceived]);

  function subscribeSocket(socket) {
    socket.on("startGame", (payload) => {
      console.log("GameStarted");
      console.log(payload);
      gameState.current = payload;
      console.log(gameState.current);
      setIsInitialGamestateReceived(true);
    });
    socket.on("receiveGameState", (serverGameState, acknowledgedPackets) => {
      // gameState.current = serverGameState;
      //console.log(clientSideReconciliationRef.current);
      clientSideReconciliationRef.current(serverGameState, acknowledgedPackets);
      console.log(acknowledgedPackets);
    });
    return () => {
      socket.off("startGame");
      socket.off("receiveGameState");
    };
  }

  return <div ref={p5Ref}></div>;
}

export default TDMArena;
