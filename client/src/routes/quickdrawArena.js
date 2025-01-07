import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import GoodBadAndUglyURL from "../audio/The Good, the Bad and the Ugly  Main Theme  Ennio Morricone.ogg";
import GunshotURL from "../audio/Gunshot.ogg";
import DrumrollURL from "../audio/Drumroll.ogg";
import useSound from "use-sound";
import { useEffect, useState, useCallback, useMemo } from "react";
import useSocket from "../hooks/useSocket";
//import { Socket } from "socket.io-client";

// require("react-dom");
// window.React2 = require("react");
// console.log(window.React1 === window.React2);

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

function QuickdrawArena({
  authHelper,
  navigate,
  userInfo, //client information
  gameInfo, //game connection info, received from matchmaking service
  gameInfoSetter, //needed to reset when user runs or game ends
  refreshToken,
}) {
  const PREGAME_PHASE_TEXT = "OR-RPS";
  const GAME_OVER_TEXT = "GAME OVER";
  const EMOJI_READY_PHASE = "🪈";
  const EMOJI_DRAW_PHASE = "💣";
  const EMOJI_END_PHASE = "💥";
  const EMOJI_THINKING = "🤔";
  const EMOJI_ROCK = "🗿";
  const EMOJI_PAPER = "📄";
  const EMOJI_SCISSORS = "✂️";
  const EMOJI_TOO_EARLY = "❌";
  const EMOJI_ERROR = "☣️";

  const GAME_PHASES = {
    PRE_GAME: 1,
    READY: 2,
    DRAW: 3,
    END: 4,
    OVER: 5,
  };

  const initialGameDisplayState = {
    titleText: Math.ceil((gameInfo.roundStartTime - Date.now()) / 1000),
    gamePhase: GAME_PHASES.PRE_GAME,
    numRoundsToWin: 3,
    player1_hand:
      gameInfo.player1.emoji != "" ? gameInfo.player1.emoji : EMOJI_THINKING,
    player1_score: 0,
    player1_CBM: 0,
    player2_hand:
      gameInfo.player2.emoji != "" ? gameInfo.player2.emoji : EMOJI_THINKING,
    player2_score: 0,
    player2_CBM: 0,
  };

  const [playGoodBadUglyAudio, goodBadUglyAudio] = useSound(GoodBadAndUglyURL, {
    volume: 0.1,
  });
  const [playGunshot, gunshotAudio] = useSound(GunshotURL, { volume: 0.1 });
  const [playDrumroll, drumrollAudio] = useSound(DrumrollURL, { volume: 0.1 });

  const [gameDisplayState, setGameDisplayState] = useState(
    initialGameDisplayState
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isAcceptingHandsInput, setIsAcceptingHandsInput] = useState(false);
  const [isAcceptingRunningInput, setIsAcceptingRunningInput] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const socket = useSocket(refreshToken, isConnected);
  const [isSocketSetup, setIsSocketSetup] = useState(false);

  function subscribeSocket(socket) {
    // console.log("socket instanceof Socket");
    // console.log(socket instanceof Socket);

    //Begin Phase Events
    socket.on("BeginReadyPhase", (payload) => {
      console.log(`ReadyPhase Begun, ${payload} seconds till Draw`);
      setGameDisplayState((prev) => ({
        ...prev,
        gamePhase: GAME_PHASES.READY,
        titleText: EMOJI_READY_PHASE,
        //reset the player hands
        player1_hand:
          gameInfo.player1.emoji != ""
            ? gameInfo.player1.emoji
            : EMOJI_THINKING,
        player2_hand:
          gameInfo.player2.emoji != ""
            ? gameInfo.player2.emoji
            : EMOJI_THINKING,
      }));
      playGoodBadUglyAudio();
      setIsAcceptingHandsInput(true);
      //change gamestate and handle the Ready State
    });
    socket.on("BeginDrawPhase", (payload) => {
      console.log(`DrawPhase Begun`);
      setIsAcceptingRunningInput(false);
      setGameDisplayState((prev) => ({
        ...prev,
        gamePhase: GAME_PHASES.DRAW,
        titleText: EMOJI_DRAW_PHASE,
      }));
      goodBadUglyAudio.stop();
      playGunshot();
      playDrumroll();
      //change gamestate and handle the Draw State
    });
    socket.on("BeginEndPhase", (payload) => {
      console.log(`EndPhase Begun`);
      setGameDisplayState((prev) => ({
        ...prev,
        gamePhase: GAME_PHASES.END,
        titleText: EMOJI_END_PHASE,
      }));
      playGunshot();
      drumrollAudio.stop();
      setIsAcceptingRunningInput(true);
      setIsAcceptingHandsInput(false);
      //change gamestate and handle the End State
    });
    socket.on("EndGame", (payload) => {
      console.log(`Game Ended`);
      setGameDisplayState((prev) => ({
        ...prev,
        titleText: GAME_OVER_TEXT,
      }));
      // setIsAcceptingHandsInput(false);
      //change gamestate and handle the End State
    });
    socket.on("ReceiveNewGameState", (payload) => {
      console.log(`newGameState`);
      console.log(payload);
      setGameDisplayState((prev) => ({
        ...prev,
        numRoundsToWin: payload.header.numRoundsToWin,
        player1_score: payload.header.player_1_score,
        player2_score: payload.header.player_2_score,
        player1_CBM: payload.header.player_1_CBM,
        player2_CBM: payload.header.player_2_CBM,
        //dont reset yet, let the players see the outcome of the last round before for a second
        // player1_hand:
        //   gameInfo.player1.emoji != ""
        //     ? gameInfo.player1.emoji
        //     : EMOJI_THINKING,
        // player2_hand:
        //   gameInfo.player2.emoji != ""
        //     ? gameInfo.player2.emoji
        //     : EMOJI_THINKING,
      }));
      //change gamestate and handle the End State
    });
    socket.on("ReceiveHand", (isPlayer1, hand) => {
      // console.log("displayState before receiving hand");
      // console.log(gameDisplayState);
      let emojiFromHand =
        hand == "rock"
          ? EMOJI_ROCK
          : hand == "paper"
          ? EMOJI_PAPER
          : hand == "scissors"
          ? EMOJI_SCISSORS
          : hand == "tooEarly"
          ? EMOJI_TOO_EARLY
          : EMOJI_ERROR;

      setGameDisplayState((prev) => {
        return isPlayer1
          ? {
              ...prev,
              player1_hand: emojiFromHand,
            }
          : {
              ...prev,
              player2_hand: emojiFromHand,
            };
      });
    });
    socket.on("PlayerRan", () => {
      console.log("other player Left");
      setGameDisplayState((prev) => ({
        ...prev,
        titleText: "Other Player Left",
      }));
      setIsConnected(false);
    });

    // if (!isSocketSetup) setIsSocketSetup(true);

    return () => {
      // console.log("socket cleanup");
      setIsSocketSetup(false);
      socket.off("BeginReadyPhase");
      socket.off("BeginDrawPhase");
      socket.off("BeginEndPhase");
      socket.off("EndEndPhase");
      socket.off("ReceiveHand");
      socket.off("ReceiveNewGameState");
      socket.off("PlayerRan");
      goodBadUglyAudio.stop();
    };
  }

  //onGetSocket, subscribe to all events needed to play the game
  useEffect(() => {
    // isSocketSetup
    //   ? console.log("socket isSocketSetup")
    //   : console.log("socket not isSocketSetup");
    // console.log("socket handler UseEffect Running");

    if (socket && socket.connected) {
      // console.log("subscribeSocket");
      let unsubscribeSocket = subscribeSocket(socket);
      setIsSocketSetup(true);

      return unsubscribeSocket;
    } else {
      // console.log("Socket UseEffect: Socket unable to be setup");
    }
  }, [socket, socket?.connected]);

  useEffect(() => {
    // isRegistered
    //   ? console.log("socket isRegistered")
    //   : console.log("socket not isRegistered");
    if (isSocketSetup && !isRegistered) {
      if (socket?.connected) {
        console.log("socket registered");
        registerSocket(socket, gameInfo);
        setIsRegistered(true);
      }
    }
  }, [socket, isRegistered, isSocketSetup]);

  function registerSocket(socket, gameInfo) {
    console.log(gameInfo);
    socket.emit("quickdraw_register", gameInfo);
  }

  //for debugging
  // useEffect(() => {
  //   console.log("socket changed");
  //   console.log(socket);
  //   if (socket instanceof Socket) {
  //     console.log("socket.connected");
  //     console.log(socket.connected);
  //   }

  //   console.log(" ");
  // }, [socket]);
  // useEffect(() => {
  //   console.log("isConnected changed");
  //   console.log(isConnected);
  // }, [isConnected]);
  // useEffect(() => {
  //   console.log("displayState changed");
  //   console.log(gameDisplayState);
  // }, [gameDisplayState]);

  const playHand = useCallback(
    (hand) => {
      console.log("playing hand: " + hand);
      console.log("gameDisplayState.gamePhase: " + gameDisplayState.gamePhase);

      socket.emit(
        "quickdraw_playHand",
        //userInfo.userId, //the socket knows the client when its authorized
        gameInfo.sessionId,
        hand
      );

      //set display client side, other clients will experience a delay before this is reflected
      if (gameDisplayState.gamePhase == GAME_PHASES.DRAW) {
        setGameDisplayState((prev) => {
          return gameInfo.player1.userId == userInfo.userId
            ? {
                ...prev,
                player1_hand:
                  hand == "rock"
                    ? EMOJI_ROCK
                    : hand == "paper"
                    ? EMOJI_PAPER
                    : EMOJI_SCISSORS,
              }
            : {
                ...prev,
                player2_hand:
                  hand == "rock"
                    ? EMOJI_ROCK
                    : hand == "paper"
                    ? EMOJI_PAPER
                    : EMOJI_SCISSORS,
              };
        });
      } else {
        //this is client side, we know that the hand is invalid, we can hard set it to be wrong
        setGameDisplayState((prev) => {
          return gameInfo.player1.userId == userInfo.userId
            ? {
                ...prev,
                player1_hand: EMOJI_TOO_EARLY,
              }
            : {
                ...prev,
                player2_hand: EMOJI_TOO_EARLY,
              };
        });
        setIsAcceptingHandsInput(false);
      }
    },
    [userInfo, socket, gameDisplayState]
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
  }, [gameDisplayState.titleText]); //on arena mount, this function will trigger and then retrigger itself until the roundStartTime is in the past.

  //STARTGAME, SET ISCONNECTED TO TRUE OF FALSE
  useEffect(() => {
    //2nd, the game is started. On game found, the socket needs to be setup
    const startGame = async () => {
      setGameDisplayState({
        ...gameDisplayState,
        titleText: EMOJI_READY_PHASE,
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
      console.log("starting Game");
      startGame(); //this should only run once
      //}
    }, gameInfo.roundStartTime - Date.now());
    return () => {
      //ignore = true;
      clearTimeout(timer);
    };
  }, [gameInfo, authHelper]);

  const run = useCallback(async () => {
    socket.emit("quickdraw_run", gameInfo.sessionId);
    setIsConnected(false);
    // await authHelper(API_ROUTES.GAME.QUICKDRAW.RUN, "POST", {
    //   session_id: gameInfo.sessionId,
    // });
    // gameInfoSetter({});
    navigate(PAGES.MAIN_MENU);
  }, [socket, authHelper]);

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
      <RunPopup
        setIsAcceptingHandsInput={setIsAcceptingHandsInput}
        setIsRunning={setIsRunning}
        isRunning={isRunning}
        run={() => {
          run();
        }}
        navigate={navigate}
      />
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
              <div className="arenaEmoji">{gameDisplayState.player1_hand}</div>
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
              <div className="arenaEmoji">{gameDisplayState.player2_hand}</div>
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
              {isConnected ? (
                <button
                  style={{ flex: 1 }}
                  className="defaultColor"
                  onClick={async () => {
                    setIsAcceptingHandsInput(false);
                    setIsRunning(true);
                  }}
                >
                  Run
                </button>
              ) : (
                <button
                  style={{ flex: 1 }}
                  className="defaultColor"
                  onClick={async () => {
                    navigate(PAGES.MAIN_MENU);
                  }}
                >
                  Leave
                </button>
              )}
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

function RunPopup({
  setIsAcceptingHandsInput,
  setIsRunning,
  isRunning,
  run,
  navigate,
}) {
  if (isRunning)
    return (
      <div
        style={{
          width: "40%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
        }}
        className="leftBorder rightBorder topBorder bottomBorder"
      >
        <button
          style={{ flex: 1, fontSize: "40px" }}
          className="notInteractableColor"
        >
          Are you sure you want to run?
        </button>
        <div style={{ flex: 4, display: "flex" }}>
          <button
            style={{ flex: 1, paddingBottom: "20px" }}
            className="defaultColor"
            onClick={async () => {
              await run();
              navigate(PAGES.MAIN_MENU);
            }}
          >
            yes
          </button>
          <button
            style={{ flex: 1, paddingBottom: "20px" }}
            className="defaultColor leftBorder"
            onClick={() => {
              setIsAcceptingHandsInput(true);
              setIsRunning(false);
            }}
          >
            no
          </button>
        </div>
      </div>
    );
}
export default QuickdrawArena;
