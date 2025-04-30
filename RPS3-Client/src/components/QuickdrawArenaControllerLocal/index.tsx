import { useEffect, useState, useRef } from "react";
import useSound from "use-sound";
import GoodBadAndUglyURL from "../../assets/audio/The Good, the Bad and the Ugly  Main Theme  Ennio Morricone.ogg";
import GunshotURL from "../../assets/audio/Gunshot.ogg";
import DrumrollURL from "../../assets/audio/Drumroll.ogg";

import QuickdrawArenaView from "../QuickdrawArenaView";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";

import useCountdownMs from "../../hooks/useCountdownMs";

export default function QuickdrawArenaControllerLocal({ setDisplayState, quickdrawSessionData }) {
  const [viewModel, setViewModel] = useState<QuickdrawArenaViewModel>({
    titleText: EMOJIS.BOMB,
    gamePhase: GamePhases.PRE_GAME,
    numRoundsToWin: 3,
    player1_hand: EMOJIS.LEFT_HAND,
    player1_score: 0,
    player1_purplePoints: 0,
    player2_hand: EMOJIS.RIGHT_HAND,
    player2_score: 0,
    player2_purplePoints: 0,
  });

  const [playGoodBadUglyAudio, goodBadUglyAudio] = useSound(GoodBadAndUglyURL, {
    volume: 0.1,
  });
  const [playGunshot, gunshotAudio] = useSound(GunshotURL, { volume: 0.1 });
  const [playDrumroll, drumrollAudio] = useSound(DrumrollURL, { volume: 0.1 });

  const COUNTDOWN_TIME = 1000; //5 seconds
  const timeLeft = useCountdownMs(COUNTDOWN_TIME);
  const [gameState, setGameState] = useState<GameState>(createGameState());
  const [isAcceptingHandsInput, setIsAcceptingHandsInput] = useState(false);
  const isCancelledRef = useRef(false); // Ref for cancellation flag
  const roundTimeouts = useRef<{
    drawTimeout?: NodeJS.Timeout;
    endTimeout?: NodeJS.Timeout;
    resolveTimeout?: NodeJS.Timeout;
  }>({});

  useEffect(() => {
    //register keydown event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "q") {
        setViewModel((viewModel) => ({ ...viewModel, player1_hand: EMOJIS.ROCK }));
      } else if (event.key === "w") {
        setViewModel((viewModel) => ({ ...viewModel, player1_hand: EMOJIS.PAPER }));
      } else if (event.key === "e") {
        setViewModel((viewModel) => ({ ...viewModel, player1_hand: EMOJIS.SCISSORS }));
      } else if (event.key === "ArrowLeft") {
        setViewModel((viewModel) => ({ ...viewModel, player2_hand: EMOJIS.ROCK }));
      } else if (event.key === "ArrowDown") {
        setViewModel((viewModel) => ({ ...viewModel, player2_hand: EMOJIS.PAPER }));
      } else if (event.key === "ArrowRight") {
        setViewModel((viewModel) => ({ ...viewModel, player2_hand: EMOJIS.SCISSORS }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //initial countdown to game start
  useEffect(() => {
    if (timeLeft == 0) return;
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, titleText: String(Math.ceil(timeLeft / 1000)) };
    });
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft == 0) {
      //start game after countdown
      doGame();
    }
  }, [timeLeft]);

  async function doGame() {
    isCancelledRef.current = false; // Reset the flag when starting a new game
    while (gameState.game.isFinished == false) {
      await doRound();
    }
  }

  async function doRound(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (isCancelledRef.current) {
        reject("Game cancelled");
        return;
      }

      let drawTime = Math.random() * 8 + 3;
      let endTime = Math.random() * 3 + 3 + drawTime;
      beginStartPhase();
      // let now = Date.now();

      const drawTimeout = setTimeout(() => {
        beginDrawPhase();
      }, drawTime * 1000);
      const endTimeout = setTimeout(() => {
        beginEndPhase();
        if (!gameState.game.isFinished && !isCancelledRef.current) updateGameStateAfterRound();
      }, endTime * 1000);
      const resolveTimeout = setTimeout(() => {
        if (gameState.game.isFinished || isCancelledRef.current) endGame();
        resolve();
      }, (endTime + 3) * 1000);

      roundTimeouts.current = {
        drawTimeout,
        endTimeout,
        resolveTimeout,
      };
    });
  }

  function clearRoundTimeouts() {
    if (roundTimeouts.current.drawTimeout) {
      clearTimeout(roundTimeouts.current.drawTimeout);
    }
    if (roundTimeouts.current.endTimeout) {
      clearTimeout(roundTimeouts.current.endTimeout);
    }
    if (roundTimeouts.current.resolveTimeout) {
      clearTimeout(roundTimeouts.current.resolveTimeout);
    }
    roundTimeouts.current = {}; // Clear the ref
  }

  function beginStartPhase() {
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return {
        ...prev,
        gamePhase: GamePhases.START,
        titleText: EMOJIS.FLUTE,
        player1_hand: EMOJIS.LEFT_HAND,
        player2_hand: EMOJIS.RIGHT_HAND,
      };
    });
    playGoodBadUglyAudio();
    setIsAcceptingHandsInput(true);
  }

  function beginDrawPhase() {
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, gamePhase: GamePhases.DRAW, titleText: EMOJIS.BOMB };
    });
    goodBadUglyAudio.stop();
    playGunshot();
    playDrumroll();
  }

  function beginEndPhase() {
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, gamePhase: GamePhases.END, titleText: EMOJIS.POW };
    });
    playGunshot();
    drumrollAudio.stop();
    setIsAcceptingHandsInput(false);
  }

  function updateGameStateAfterRound() {}

  function endGame() {
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, gamePhase: GamePhases.OVER, titleText: "GAME OVER" };
    });
  }

  useEffect(() => {
    return () => {
      isCancelledRef.current = true; // Set the flag when the component unmounts
      clearRoundTimeouts(); // Clear any pending timeouts
      goodBadUglyAudio.stop();
      gunshotAudio.stop();
      drumrollAudio.stop();
    };
  }, []);

  const testView = () => {
    return (
      <div style={{ display: "flex", position: "absolute" }}>
        <datalist id="emoji-choices">
          <option value={EMOJIS.FLUTE}></option>
          <option value={EMOJIS.BOMB}></option>
          <option value={EMOJIS.POW}></option>
          <option value={EMOJIS.ROCK}></option>
          <option value={EMOJIS.PAPER}></option>
          <option value={EMOJIS.SCISSORS}></option>
        </datalist>
        <input
          type="text"
          list="emoji-choices"
          onChange={(event) => setViewModel((viewModel) => ({ ...viewModel, titleText: event.target.value }))}
          style={{ width: "5rem" }}
        />
        <input
          type="number"
          onChange={(event) =>
            setViewModel((viewModel) => ({ ...viewModel, numRoundsToWin: Number(event.target.value) }))
          }
          style={{ width: "5rem" }}
        />
        <input
          type="number"
          onChange={(event) =>
            setViewModel((viewModel) => {
              console.log(viewModel.player1_score);
              return { ...viewModel, player1_score: Number(event.target.value) };
            })
          }
          style={{ width: "5rem" }}
        />
        <input
          type="number"
          onChange={(event) =>
            setViewModel((viewModel) => {
              console.log(viewModel.player1_purplePoints);
              return { ...viewModel, player1_purplePoints: Number(event.target.value) };
            })
          }
          style={{ width: "5rem" }}
        />
        <input
          type="number"
          onChange={(event) =>
            setViewModel((viewModel) => ({ ...viewModel, player2_score: Number(event.target.value) }))
          }
          style={{ width: "5rem" }}
        />
        <input
          type="number"
          onChange={(event) =>
            setViewModel((viewModel) => ({ ...viewModel, player2_purplePoints: Number(event.target.value) }))
          }
          style={{ width: "5rem" }}
        />
      </div>
    );
  };

  return (
    <>
      {testView()}
      <QuickdrawArenaView
        viewModel={viewModel}
        onClicks={{
          Rock: () => {
            setViewModel((prev: QuickdrawArenaViewModel) => ({ ...prev, player1_hand: EMOJIS.ROCK }));
          },
          Paper: () => {
            setViewModel((prev: QuickdrawArenaViewModel) => ({ ...prev, player1_hand: EMOJIS.PAPER }));
          },
          Scissors: () => {
            setViewModel((prev: QuickdrawArenaViewModel) => ({ ...prev, player1_hand: EMOJIS.SCISSORS }));
          },
          Back: () => {
            isCancelledRef.current = true;
            clearRoundTimeouts();
            goodBadUglyAudio.stop();
            gunshotAudio.stop();
            drumrollAudio.stop();
            setDisplayState("Home");
          },
        }}
        setMainDisplayState={setDisplayState}
        quickdrawSessionData={quickdrawSessionData}
      />
    </>
  );
}

interface GameState {
  actions: Array<{}>;
  game: {
    isFinished: boolean;
    // players?: {
    //   player_1: string;
    //   player_2: string;
    // };
    header: {
      // gameType: string;
      numRoundsToWin: number;
      player1_score: number;
      player1_purplePoints: number;
      player2_score: number;
      player2_purplePoints: number;
    };
    rounds?: Array<{}>;
  };
}

function createGameState(): GameState {
  let gameState: GameState = {
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
    // gameStartTime: gameStartTime,
    game: {
      isFinished: false,
      // players: {
      //   player_1: roster.players[0],
      //   player_2: roster.players[1],
      // },
      header: {
        // gameType: "Q",
        numRoundsToWin: 3,
        player1_score: 0,
        player1_purplePoints: 0,
        player2_score: 0,
        player2_purplePoints: 0,
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
  return gameState;
}
