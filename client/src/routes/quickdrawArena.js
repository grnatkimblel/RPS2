import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import { useEffect, useState } from "react";
// import { gameControllerSocket as socket } from "../socket";
import { getNewAccessToken } from "./helper";

function QuickdrawArena({
  authHelper,
  navigate,
  gameInfo,
  gameInfoSetter,
  setAccessToken,
  accessToken,
  refreshToken,
}) {
  const initialGameState = {
    titleText: Math.ceil((gameInfo.roundStartTime - Date.now()) / 1000),
    isCountdownOver: false,
    numRoundsToWin: 3,
    player1_score: 0,
    player1_CBM: 0,
    player2_score: 0,
    player2_CBM: 0,
  };

  const [gameState, setGameState] = useState(initialGameState);
  const [isConnected, setIsConnected] = useState(false);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`http://localhost:3000`, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token: accessToken },
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket, accessToken]);

  useEffect(() => {
    const startGame = async () => {
      setGameState({ ...gameState, titleText: "RPS" });
      //request on api that starts the game.
      console.log("useTimeout executing");
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
            registerSocket(gameInfo.sessionId);
          } else {
            setIsConnected(false);
            //TODO: opponent ran, display something to tell the player
          }
        });
    };

    const timer = setTimeout(() => {
      startGame();
    }, gameInfo.roundStartTime - Date.now());
  }, [gameInfo]);

  useEffect(() => {
    if (isConnected) socket.connect();
    else socket.disconnect();

    return () => {
      socket.disconnect();
    };
  }, [isConnected]);

  useEffect(() => {
    let countdown;
    if (gameInfo.roundStartTime - Date.now() > 1000) {
      countdown = setTimeout(() => {
        setGameState((prev) => {
          return { ...prev, titleText: prev.titleText - 1 };
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdown);
    };
  }, [gameState.titleText]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      alert(data.message);
    });
    socket.on("connect_error", async (error) => {
      console.error("Connection error:", error);

      if (error.message === "Unauthorized") {
        const newAccessToken = await getNewAccessToken(refreshToken);
        setAccessToken(newAccessToken);
        //this may not retry whatever call failed but sockets might be really fast so idk. maybe ensure acknowledgements on all client side calls
      }
    });
  }, [socket, setAccessToken]);

  const run = async () => {
    setIsConnected(false);
    await authHelper(API_ROUTES.GAME.QUICKDRAW.RUN, "POST", {
      session_id: gameInfo.sessionId,
    });
    gameInfoSetter({});
  };

  const getScoreCards = (playerScore, isLeft) => {
    const border = isLeft ? "leftBorder" : "rightBorder";
    const cards = Array(gameState.numRoundsToWin)
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
      <div className="title">{gameState.titleText}</div>
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
              {getScoreCards(gameState.player1_score, true)}
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
              {getScoreCards(gameState.player2_score, false)}
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
                {getCBM(gameState.player1_CBM)}
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
                {getCBM(gameState.player2_CBM)}
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
              <button style={{ flex: 1 }} className="defaultColor bottomBorder">
                Rock
              </button>
              <button style={{ flex: 1 }} className="defaultColor">
                Paper
              </button>
            </div>
            <div
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
              className="leftBorder"
            >
              <button style={{ flex: 1 }} className="defaultColor bottomBorder">
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

function registerSocket(session_id) {
  socket.emit("register", session_id);
  socket.on("test", (payload) => {
    console.log("test");
    console.log(payload);
  });
}

export default QuickdrawArena;
