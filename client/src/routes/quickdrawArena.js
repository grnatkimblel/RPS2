import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import GoodBadAndUglyURL from "../audio/The Good, the Bad and the Ugly  Main Theme  Ennio Morricone.ogg";
import useSound from "use-sound";
import { useEffect, useState, useCallback, useMemo } from "react";
import useSocket from "../hooks/useSocket";

require("react-dom");
window.React2 = require("react");
console.log(window.React1 === window.React2);

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


idk what this is
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

function QuickdrawArena({
  authHelper,
  navigate,
  userInfo,
  gameInfo,
  gameInfoSetter,
  refreshToken,
}) {
  const initialGameDisplayState = {
    titleText: Math.ceil((gameInfo.roundStartTime - Date.now()) / 1000),
    gamePhase: "pregame",
    numRoundsToWin: 3,
    player1_score: 0,
    player1_CBM: 0,
    player2_score: 0,
    player2_CBM: 0,
  };

  const PREGAME_PHASE_TEXT = "RPS";
  const READY_PHASE_EMOJI = "🪈";
  const DRAW_PHASE_EMOJI = "💣";
  const END_PHASE_EMOJI = "💥";

  const [playGoodBadUglyAudio, goodBadUglyAudio] = useSound(GoodBadAndUglyURL, {
    volume: 0.1,
  });

  const [gameDisplayState, setGameDisplayState] = useState(
    initialGameDisplayState
  );
  const [isAcceptingHandsInput, setIsAcceptingHandsInput] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const socket = useSocket(refreshToken, isConnected);

  useEffect(() => {
    socket.then(
      (socket) => {
        if (!socket) return;
        console.log(socket);

        //Begin Phase Events
        socket.on("BeginReadyPhase", (payload) => {
          console.log(`ReadyPhase Begun, ${payload} seconds till Draw`);
          setGameDisplayState((prev) => ({
            ...prev,
            gamePhase: "Ready",
            titleText: READY_PHASE_EMOJI,
          }));
          setIsAcceptingHandsInput(true);
          //change gamestate and handle the Ready State
        });
        socket.on("BeginDrawPhase", (payload) => {
          console.log(`DrawPhase Begun`);
          setGameDisplayState((prev) => ({
            ...prev,
            gamePhase: "Draw",
            titleText: DRAW_PHASE_EMOJI,
          }));
          //change gamestate and handle the Draw State
        });
        socket.on("BeginEndPhase", (payload) => {
          console.log(`EndPhase Begun`);
          setGameDisplayState((prev) => ({
            ...prev,
            gamePhase: "End",
            titleText: END_PHASE_EMOJI,
          }));
          setIsAcceptingHandsInput(false);
          //change gamestate and handle the End State
        });

        if (!isRegistered) {
          registerSocket(socket, gameInfo);
          setIsRegistered(true);
        }

        return () => {
          socket.off("BeginReadyPhase");
          socket.off("BeginDrawPhase");
          socket.off("BeginEndPhase");
        };
      },
      [socket, isRegistered]
    );
  });

  function registerSocket(socket, gameInfo) {
    console.log("Socket connected To Server");
    socket.emit("register", gameInfo);
  }

  const playHand = useCallback(
    (hand) => {
      console.log("playing hand: " + hand);
      console.log("userInfo: " + userInfo);
      socket.then((socket) => {
        socket.emit("playHand", userInfo.userId, gameInfo.sessionId, hand);
      });
    },
    [userInfo, socket]
  );

  //STARTS COUNTDOWN
  useEffect(() => {
    //1st the countdown
    let countdown;
    if (gameInfo.roundStartTime - Date.now() > 1000) {
      countdown = setTimeout(() => {
        setGameDisplayState((prev) => {
          return { ...prev, titleText: prev.titleText - 1 };
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdown);
    };
  }, [gameInfo.titleText]); //on arena mount, this function will trigger and then retrigger itself until the roundStartTime is in the past.

  //STARTGAME, SET ISCONNECTED TO TRUE OF FALSE
  useEffect(() => {
    //2nd, the game is started. On game found, the socket needs to be setup
    const startGame = async () => {
      setGameDisplayState({
        ...gameDisplayState,
        titleText: READY_PHASE_EMOJI,
      });
      //request on api that starts the game.
      await authHelper(API_ROUTES.GAME.QUICKDRAW.START_GAME, "POST", {
        session_id: gameInfo.sessionId,
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log("gameFound: ", data.gameFound);
          if (data.gameFound) {
            setIsConnected(true);
          } else {
            setIsConnected(false);
            //TODO: opponent ran, display something to tell the player
          }
        });
    };

    // let ignore = false;
    const timer = setTimeout(() => {
      // if (!ignore) {
      console.log("useTimeout executing");
      startGame(); //this should only run once
      //}
    }, gameInfo.roundStartTime - Date.now());
    return () => {
      //ignore = true;
      clearTimeout(timer);
    };
  }, [gameInfo, authHelper]);

  //update assets based on gameDisplayState
  useEffect(() => {
    if (gameDisplayState.gamePhase == "Ready") {
      playGoodBadUglyAudio();
      console.log("gamePhase: Ready");
    }
    if (gameDisplayState.gamePhase == "Draw") {
      goodBadUglyAudio.stop();
      console.log("gamePhase: Draw");
    }
  }, [gameDisplayState.gamePhase, playGoodBadUglyAudio, goodBadUglyAudio]);

  const run = async () => {
    setIsConnected(false);
    await authHelper(API_ROUTES.GAME.QUICKDRAW.RUN, "POST", {
      session_id: gameInfo.sessionId,
    });
    gameInfoSetter({});
  };

  const getScoreCards = (playerScore, isLeft) => {
    const border = isLeft ? "leftBorder" : "rightBorder";
    const cards = Array(gameDisplayState.numRoundsToWin)
      .fill(1)
      .map((el, i) => {
        const scoreColor =
          i < playerScore ? "submittable" : "notInteractableColor";
        return (
          <div
            key={i}
            className={"scoreCards " + border + " " + scoreColor}
          ></div>
        );
      });
    return isLeft ? cards : cards.reverse();
  };

  const getCBM = (playerCBM) => {
    const text = ["C", "B", "M"];
    const CBM = text.map((letter, i) => {
      const color = i < playerCBM ? "submittable" : "notInteractableColor";
      return (
        <span
          style={{
            letterSpacing: "10px",
            fontFamily: "ComicSans",
            fontSize: "60px",
          }}
          key={i}
          className={color}
        >
          {letter}
        </span>
      );
    });
    return CBM;
  };

  return (
    <>
      <div className="title">{gameDisplayState.titleText}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          id="topRow"
          style={{
            display: "flex",
            flex: 1,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
            className="notInteractableColor bottomBorder topRow"
          >
            <button
              style={{ marginLeft: "20px", marginTop: "-20px" }}
              className="notInteractableColor"
            >
              {gameInfo.player1.username}
            </button>

            <div
              style={{ display: "flex", width: "60%", justifyContent: "end" }}
            >
              {getScoreCards(gameDisplayState.player1_score, true)}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
            className="notInteractableColor bottomBorder leftBorder topRow"
          >
            <div style={{ display: "flex", width: "60%" }}>
              {getScoreCards(gameDisplayState.player2_score, false)}
            </div>

            <button
              style={{ marginRight: "20px", marginTop: "-20px" }}
              className="notInteractableColor"
            >
              {gameInfo.player2.username}
            </button>
          </div>
        </div>
        <div
          id="middleRow"
          style={{
            display: "flex",
            flex: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
            }}
            className="notInteractableColor bottomBorder"
          >
            <div style={{ position: "absolute" }}>
              {/* <StatsButton /> */}
              <span style={{ marginLeft: "15px" }}>
                {getCBM(gameDisplayState.player1_CBM)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "auto",
                justifyContent: "space-between",
              }}
            >
              <div className="arenaEmoji">{gameInfo.player1.emoji}</div>
              <div className="arenaEmoji">🗿</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
            }}
            className="notInteractableColor bottomBorder leftBorder"
          >
            <div style={{ position: "absolute", right: "0" }}>
              <span style={{ marginRight: "5px" }}>
                {getCBM(gameDisplayState.player2_CBM)}
              </span>
              {/* <StatsButton /> */}
            </div>
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "auto",
                justifyContent: "space-between",
              }}
            >
              <div className="arenaEmoji">🗿</div>
              <div className="arenaEmoji">{gameInfo.player2.emoji}</div>
            </div>
          </div>
        </div>
        <div
          id="bottomRow"
          style={{
            display: "flex",
            flex: 2,
          }}
        >
          <div style={{ flex: 1 }}>
            <button
              style={{ width: "100%", height: "100%" }}
              className="notInteractableColor"
            >
              What will you do?
            </button>
          </div>
          <div style={{ flex: 1, display: "flex" }} className="leftBorder">
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <button
                style={{ flex: 1 }}
                className={
                  (isAcceptingHandsInput
                    ? "defaultColor "
                    : "notInteractableColor ") + "bottomBorder"
                }
                onClick={() => playHand("rock")}
              >
                Rock
              </button>
              <button
                style={{ flex: 1 }}
                className={
                  isAcceptingHandsInput
                    ? "defaultColor "
                    : "notInteractableColor "
                }
                onClick={() => playHand("paper")}
              >
                Paper
              </button>
            </div>
            <div
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
              className="leftBorder"
            >
              <button
                style={{ flex: 1 }}
                className={
                  (isAcceptingHandsInput
                    ? "defaultColor "
                    : "notInteractableColor ") + "bottomBorder"
                }
                onClick={() => playHand("scissors")}
              >
                Scissors
              </button>
              <button
                style={{ flex: 1 }}
                className="defaultColor"
                onClick={async () => {
                  await run();
                  navigate(`/${PAGES.MAIN_MENU}`);
                }}
              >
                Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatsButton({ playerStats }) {
  const [isExpanded, setIsExpanded] = useState(false);
  //   console.log(isExpanded);
  return isExpanded ? (
    <div className="stats">
      <div
        style={{ padding: "20px" }}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
        }}
      >
        <div>Rock</div>
        <div>Paper</div>
        <div>Scissors</div>
        <div>Proactive</div>
        <div>Reactive</div>
      </div>
      <div style={{ pointerEvents: "none" }}>
        <button
          style={{ pointerEvents: "auto" }}
          className="defaultColor topBorder secondary"
        >
          All Time
        </button>
      </div>
    </div>
  ) : (
    <button
      style={{ padding: "20px" }}
      className="stats"
      onClick={() => setIsExpanded(true)}
    >
      📖
    </button>
  );
}

export default QuickdrawArena;
