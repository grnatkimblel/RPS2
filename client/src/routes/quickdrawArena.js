import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import GoodBadAndUglyURL from "../audio/The Good, the Bad and the Ugly  Main Theme  Ennio Morricone.ogg";
import GunshotURL from "../audio/Gunshot.ogg";
import DrumrollURL from "../audio/Drumroll.ogg";
import useSound from "use-sound";
import { useEffect, useState, useCallback, useMemo } from "react";
import QuickdrawArenaDisplay from "../components/QuickdrawArenaDisplay";
import useCountdownMs from "../hooks/useCountdown";
import useGameConnection from "../hooks/useGameConnection";

/*
gameInfo:
  sessionId: roster.rosterId,
  gameStartTime: gameStartTime,
  gameType: gameType
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
  socket,
  setIsConnected,
  isConnected,
}) {
  const PREGAME_PHASE_TEXT = "OR-RPS";
  const GAME_OVER_TEXT = "GAME OVER";
  const EMOJI_START_PHASE = "🪈";
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
    START: 2,
    DRAW: 3,
    END: 4,
    OVER: 5,
  };

  const initialGameDisplayState = {
    titleText: Math.ceil((gameInfo.gameStartTime - Date.now()) / 1000),
    gamePhase: GAME_PHASES.PRE_GAME,
    numRoundsToWin: 3,
    player1_hand: gameInfo.player1.emoji !== "" ? gameInfo.player1.emoji : EMOJI_THINKING,
    player1_score: 0,
    player1_CBM: 0,
    player2_hand: gameInfo.player2.emoji !== "" ? gameInfo.player2.emoji : EMOJI_THINKING,
    player2_score: 0,
    player2_CBM: 0,
  };

  const [playGoodBadUglyAudio, goodBadUglyAudio] = useSound(GoodBadAndUglyURL, {
    volume: 0.1,
  });
  const [playGunshot, gunshotAudio] = useSound(GunshotURL, { volume: 0.1 });
  const [playDrumroll, drumrollAudio] = useSound(DrumrollURL, { volume: 0.1 });
  const timeLeft = useCountdownMs(gameInfo.gameStartTime - Date.now());

  const [gameDisplayState, setGameDisplayState] = useState(initialGameDisplayState);
  const [isRunning, setIsRunning] = useState(false);
  const [ignoreStartGame, setIgnoreStartGame] = useState(false); //if the player runs before the countdown is over, ignore the start game request
  //I dont think this ever has an effect, if the player runs this component is unmounted and so startgame wont call
  const [isAcceptingHandsInput, setIsAcceptingHandsInput] = useState(false);
  const [isAcceptingRunningInput, setIsAcceptingRunningInput] = useState(true);
  let subscriptionDetails = {
    eventName: "quickdraw_register",
    subscribeSocketFunction: subscribeSocket,
  };
  const gameSocket = useGameConnection(socket, subscriptionDetails, gameInfo);

  function subscribeSocket(socket) {
    //Begin Phase Events
    socket.on("BeginStartPhase", (payload) => {
      console.log(`StartPhase Begun, ${payload} seconds till Draw`);
      setGameDisplayState((prev) => ({
        ...prev,
        gamePhase: GAME_PHASES.START,
        titleText: EMOJI_START_PHASE,
        //reset the player hands
        player1_hand: gameInfo.player1.emoji !== "" ? gameInfo.player1.emoji : EMOJI_THINKING,
        player2_hand: gameInfo.player2.emoji !== "" ? gameInfo.player2.emoji : EMOJI_THINKING,
      }));
      playGoodBadUglyAudio();
      setIsAcceptingHandsInput(true);
      //change gamestate and handle the Start State
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
        numRoundsToWin: payload.gameState.header.numRoundsToWin,
        player1_score: payload.gameState.header.player_1_score,
        player2_score: payload.gameState.header.player_2_score,
        player1_CBM: payload.gameState.header.player_1_CBM,
        player2_CBM: payload.gameState.header.player_2_CBM,
        //dont reset yet, let the players see the outcome of the last round before for a second
        // player1_hand:
        //   gameInfo.player1.emoji !== ""
        //     ? gameInfo.player1.emoji
        //     : EMOJI_THINKING,
        // player2_hand:
        //   gameInfo.player2.emoji !== ""
        //     ? gameInfo.player2.emoji
        //     : EMOJI_THINKING,
      }));
      //change gamestate and handle the End State
    });
    socket.on("ReceiveHand", (isPlayer1, hand) => {
      // console.log("displayState before receiving hand");
      // console.log(gameDisplayState);
      let emojiFromHand =
        hand === "rock"
          ? EMOJI_ROCK
          : hand === "paper"
          ? EMOJI_PAPER
          : hand === "scissors"
          ? EMOJI_SCISSORS
          : hand === "tooEarly"
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
      setIsAcceptingHandsInput(false);
      setGameDisplayState((prev) => ({
        ...prev,
        titleText: "Other Player Left",
      }));
      setIsConnected(false);
    });

    return () => {
      // When the socket disconnects, the event listeners will remain. But once the isConnected is set to true, a new socket instance is created which will
      // cause the old socket to get garbage collected. So we dont need to worry about cleaning up the event listeners.
      // socket.off("BeginStartPhase");
      // socket.off("BeginDrawPhase");
      // socket.off("BeginEndPhase");
      // socket.off("EndEndPhase");
      // socket.off("ReceiveHand");
      // socket.off("ReceiveNewGameState");
      // socket.off("PlayerRan");
      goodBadUglyAudio.stop();
      drumrollAudio.stop();
    };
  }

  const playHand = useCallback(
    (hand) => {
      console.log("playing hand: " + hand);
      console.log("gameDisplayState.gamePhase: " + gameDisplayState.gamePhase);

      gameSocket.emit(
        "quickdraw_playHand",
        //userInfo.userId, //the socket knows the client when its authorized
        gameInfo.sessionId,
        hand
      );

      //set display client side, other clients will experience a delay before this is reflected
      if (gameDisplayState.gamePhase === GAME_PHASES.DRAW) {
        setGameDisplayState((prev) => {
          return gameInfo.player1.userId === userInfo.userId
            ? {
                ...prev,
                player1_hand: hand === "rock" ? EMOJI_ROCK : hand === "paper" ? EMOJI_PAPER : EMOJI_SCISSORS,
              }
            : {
                ...prev,
                player2_hand: hand === "rock" ? EMOJI_ROCK : hand === "paper" ? EMOJI_PAPER : EMOJI_SCISSORS,
              };
        });
      } else {
        //this is client side, we know that the hand is invalid, we can hard set it to be wrong
        setGameDisplayState((prev) => {
          return gameInfo.player1.userId === userInfo.userId
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
    [userInfo, gameSocket, gameDisplayState]
  );

  //STARTS COUNTDOWN uses useCountdown
  useEffect(() => {
    if (timeLeft == 0) return;
    setGameDisplayState((prev) => {
      return { ...prev, titleText: Math.ceil(timeLeft / 1000) };
    });
  }, [timeLeft]);

  //STARTGAME, SET ISCONNECTED TO TRUE OF FALSE
  useEffect(() => {
    //2nd, the game is started. On game found, the socket needs to be setup
    const startGame = async () => {
      setGameDisplayState({
        ...gameDisplayState,
        titleText: EMOJI_START_PHASE,
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

    const timer = setTimeout(() => {
      if (!ignoreStartGame) {
        console.log("starting Game");
        startGame(); //this should only run once
      }
    }, gameInfo.gameStartTime - Date.now());
    return () => {
      //ignore = true;
      clearTimeout(timer);
    };
  }, [gameInfo, authHelper, ignoreStartGame]);

  const run = useCallback(async () => {
    console.log("isConnected: ", isConnected);
    if (isConnected) {
      gameSocket.emit("quickdraw_run", gameInfo.sessionId);
      setIsConnected(false);
    }
    // await authHelper(API_ROUTES.GAME.QUICKDRAW.RUN, "POST", {
    //   session_id: gameInfo.sessionId,
    // });
    // gameInfoSetter({});
    //GROSS STOP INTERMINGLING HTTP AND WEBSOCKET SHIT JUST HAVE THE PLAYERS CONNECT TO THE WEBSOCKET IMMEDIATELY AND HANDLE IT FROM THERE IT WILL BE EASIER TO REASON ABOUT
    //
    navigate(PAGES.MAIN_MENU);
  }, [gameSocket, authHelper, isConnected]);

  return (
    <QuickdrawArenaDisplay
      gameDisplayState={gameDisplayState}
      gameInfo={gameInfo}
      playHand={playHand}
      isAcceptingHandsInput={isAcceptingHandsInput}
      isConnected={isConnected}
      setIsAcceptingHandsInput={setIsAcceptingHandsInput}
      setIsRunning={setIsRunning}
      isRunning={isRunning}
      run={run}
      navigate={navigate}
    />
  );
}

export default QuickdrawArena;
