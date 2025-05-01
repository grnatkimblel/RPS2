import { useEffect, useState, useRef, useCallback } from "react";
import useSound from "use-sound";
import GoodBadAndUglyURL from "../../assets/audio/The Good, the Bad and the Ugly  Main Theme  Ennio Morricone.ogg";
import GunshotURL from "../../assets/audio/Gunshot.ogg";
import DrumrollURL from "../../assets/audio/Drumroll.ogg";

import QuickdrawArenaView from "../QuickdrawArenaView";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";

import useCountdownMs from "../../hooks/useCountdownMs";
import { g, pre, view } from "motion/react-client";
import { run } from "svelte/internal";

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
  const isGameOver = useRef<boolean>(false);
  const initialRenderRefs = useRef({
    isCancelled: false, // Ref for cancellation flag
    roundTimeouts: {
      drawTimeout: null as NodeJS.Timeout | null,
      endTimeout: null as NodeJS.Timeout | null,
      resolveTimeout: null as NodeJS.Timeout | null,
    },
  });

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
    initialRenderRefs.current.isCancelled = false; // Reset the flag when starting a new game
    while (isGameOver.current == false) {
      await doRound();
    }
  }

  async function doRound(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (initialRenderRefs.current.isCancelled) {
        reject("Game cancelled");
        return;
      }
      let now = Date.now();
      let drawTime = Math.random() * 8 + 3;
      let endTime = Math.random() * 3 + 3 + drawTime;
      setGameState((prev: GameState) => {
        return {
          ...prev,
          game: {
            ...prev.game,
            rounds: [
              ...prev.game.rounds,
              {
                startTime: now,
                drawTime: now + drawTime * 1000,
                endTime: now + endTime * 1000,
                hands: {
                  player_1: {
                    hand: null,
                    time: null,
                  },
                  player_2: {
                    hand: null,
                    time: null,
                  },
                },
              },
            ],
          },
        };
      });

      beginStartPhase();
      // let now = Date.now();

      const drawTimeout = setTimeout(() => {
        beginDrawPhase();
      }, drawTime * 1000);
      const endTimeout = setTimeout(() => {
        beginEndPhase();
        if (!isGameOver.current && !initialRenderRefs.current.isCancelled) {
          updateGameStateAfterRound();
        }
      }, endTime * 1000);
      const resolveTimeout = setTimeout(() => {
        if (isGameOver.current || initialRenderRefs.current.isCancelled) endGame();
        resolve();
      }, (endTime + 3) * 1000);

      initialRenderRefs.current.roundTimeouts = {
        drawTimeout,
        endTimeout,
        resolveTimeout,
      };
    });
  }

  //prevents asynchronous game logic from running after the game is left
  function clearRoundTimeouts() {
    if (initialRenderRefs.current.roundTimeouts.drawTimeout) {
      clearTimeout(initialRenderRefs.current.roundTimeouts.drawTimeout);
    }
    if (initialRenderRefs.current.roundTimeouts.endTimeout) {
      clearTimeout(initialRenderRefs.current.roundTimeouts.endTimeout);
    }
    if (initialRenderRefs.current.roundTimeouts.resolveTimeout) {
      clearTimeout(initialRenderRefs.current.roundTimeouts.resolveTimeout);
    }
    initialRenderRefs.current.roundTimeouts = {
      drawTimeout: null,
      endTimeout: null,
      resolveTimeout: null,
    }; // Clear the ref
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

  function updateGameStateAfterRound() {
    setGameState((prev: GameState) => {
      let p1Score = 0;
      let p2Score = 0;
      let p1PP = 0;
      let p2PP = 0;

      prev.game.rounds.forEach((round) => {
        let p1 = round.hands.player_1;
        let p2 = round.hands.player_2;
        if (p1.hand !== null || p2.hand !== null) {
          //if someone played a hand
          if (didPlayer1GetPurplePoint(p1.time, p2.time)) {
            p1PP++;
          } else {
            p2PP++;
          }

          if (p1.hand !== p2.hand) {
            if (p1.hand == null) {
              p2Score++;
            } else if (p2.hand == null) {
              p1Score++;
            } else if (p1.hand === EMOJIS.ROCK && p2.hand === EMOJIS.SCISSORS) {
              p1Score++;
            } else if (p1.hand === EMOJIS.PAPER && p2.hand === EMOJIS.ROCK) {
              p1Score++;
            } else if (p1.hand === EMOJIS.SCISSORS && p2.hand === EMOJIS.PAPER) {
              p1Score++;
            } else {
              p2Score++;
            }
          }
        }
      });

      setViewModel((prev: QuickdrawArenaViewModel) => {
        return {
          ...prev,
          player1_score: p1Score,
          player2_score: p2Score,
          player1_purplePoints: p1PP,
          player2_purplePoints: p2PP,
        };
      });

      console.log(p1Score, p2Score, p1PP, p2PP);
      if (p1Score + p1PP >= prev.game.header.numRoundsToWin || p2Score + p2PP >= prev.game.header.numRoundsToWin) {
        console.log("game over");
        isGameOver.current = true;
      }

      return {
        ...prev,
        game: {
          ...prev.game,
          header: {
            ...prev.game.header,
            player1_score: p1Score,
            player1_purplePoints: p1PP,
            player2_score: p2Score,
            player2_purplePoints: p2PP,
          },
        },
      };
    });
  }

  function didPlayer1GetPurplePoint(p1Time?: number, p2Time?: number) {
    if (p1Time !== null && p2Time == null) return true;
    if (p1Time == null && p2Time !== null) return false;
    if (p1Time < p2Time) return true;
    if (p1Time > p2Time) return false;
  }

  function endGame() {
    console.log("game end called");
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, gamePhase: GamePhases.OVER, titleText: "GAME OVER" };
    });
  }

  const playHand = useCallback(
    (hand, isPlayer1) => {
      let now = Date.now();
      // console.log(gameState);
      let roundStartTime = gameState.game.rounds[gameState.game.rounds.length - 1].startTime;
      let roundDrawTime = gameState.game.rounds[gameState.game.rounds.length - 1].drawTime;
      let roundEndTime = gameState.game.rounds[gameState.game.rounds.length - 1].endTime;

      if (now > roundStartTime && now < roundDrawTime) {
        setViewModel((prev: QuickdrawArenaViewModel) => {
          return isPlayer1 ? { ...prev, player1_hand: EMOJIS.EARLY } : { ...prev, player2_hand: EMOJIS.EARLY };
        });
        //leave hand as null in gamestate
        return;
      }
      if (now > roundDrawTime && now < roundEndTime) {
        setViewModel((prev: QuickdrawArenaViewModel) => {
          return isPlayer1 ? { ...prev, player1_hand: hand } : { ...prev, player2_hand: hand };
        });
        //update gamestate with hand
        setGameState((prev: GameState) => {
          return {
            ...prev,
            game: {
              ...prev.game,
              rounds: prev.game.rounds.map((round, index) => {
                if (index === prev.game.rounds.length - 1) {
                  return isPlayer1
                    ? { ...round, hands: { ...round.hands, player_1: { hand: hand, time: now } } }
                    : { ...round, hands: { ...round.hands, player_2: { hand: hand, time: now } } };
                } else {
                  return { ...round };
                }
              }),
            },
          };
        });
      }
      return;
    },
    [viewModel, setViewModel, gameState, setGameState]
  );

  useEffect(() => {
    //register keydown event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "q") {
        playHand(EMOJIS.ROCK, true);
      } else if (event.key === "w") {
        playHand(EMOJIS.PAPER, true);
      } else if (event.key === "e") {
        playHand(EMOJIS.SCISSORS, true);
      } else if (event.key === "ArrowLeft") {
        playHand(EMOJIS.ROCK, false);
      } else if (event.key === "ArrowDown") {
        playHand(EMOJIS.PAPER, false);
      } else if (event.key === "ArrowRight") {
        playHand(EMOJIS.SCISSORS, false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playHand]);

  useEffect(() => {
    return () => {
      initialRenderRefs.current.isCancelled = true; // Set the flag when the component unmounts
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
              return { ...viewModel, player1_score: Number(event.target.value) };
            })
          }
          style={{ width: "5rem" }}
        />
        <input
          type="number"
          onChange={(event) =>
            setViewModel((viewModel) => {
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
      {/* {testView()} */}
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
            initialRenderRefs.current.isCancelled = true;
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
    header: {
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
    game: {
      isFinished: false,
      header: {
        numRoundsToWin: 3,
        player1_score: 0,
        player1_purplePoints: 0,
        player2_score: 0,
        player2_purplePoints: 0,
      },
      rounds: [],
    },
  };

  //logger.info(shellObject);
  return gameState;
}
