import { useEffect, useState, useRef, useCallback } from "react";
import useSound from "use-sound";
import GoodBadAndUglyURL from "../../assets/audio/The Good, the Bad and the Ugly  Main Theme  Ennio Morricone.ogg";
import GunshotURL from "../../assets/audio/Gunshot.ogg";
import DrumrollURL from "../../assets/audio/Drumroll.ogg";
import Whistle1URL from "../../assets/audio/whistle1.ogg";
import Whistle2URL from "../../assets/audio/whistle2.ogg";
import Whistle3URL from "../../assets/audio/whistle3.ogg";
import Whistle4URL from "../../assets/audio/whistle4.ogg";
import Whistle5URL from "../../assets/audio/whistle5.ogg";

import QuickdrawArenaView from "../QuickdrawArenaView";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";

import useCountdownMs from "../../hooks/useCountdownMs";

export default function QuickdrawArenaControllerLocal({ setDisplayState, quickdrawSessionData }) {
  const initialViewModel = {
    titleText: EMOJIS.BOMB,
    gamePhase: GamePhases.PRE_GAME,
    numRoundsToWin: 3,
    player1_hand: EMOJIS.LEFT_HAND,
    player1_score: 0,
    player1_purplePoints: 0,
    player2_hand: EMOJIS.RIGHT_HAND,
    player2_score: 0,
    player2_purplePoints: 0,
  };
  const [viewModel, setViewModel] = useState<QuickdrawArenaViewModel>(initialViewModel);

  const [playGoodBadUglyAudio, goodBadUglyAudio] = useSound(GoodBadAndUglyURL, {
    volume: 0.1,
  });
  const [playGunshot, gunshotAudio] = useSound(GunshotURL, { volume: 0.1 });
  const [playDrumroll, drumrollAudio] = useSound(DrumrollURL, { volume: 0.1 });
  const [playWhistle1, whistle1Audio] = useSound(Whistle1URL, { volume: 0.1 });
  const [playWhistle2, whistle2Audio] = useSound(Whistle2URL, { volume: 0.1 });
  const [playWhistle3, whistle3Audio] = useSound(Whistle3URL, { volume: 0.1 });
  const [playWhistle4, whistle4Audio] = useSound(Whistle4URL, { volume: 0.1 });
  const [playWhistle5, whistle5Audio] = useSound(Whistle5URL, { volume: 0.1 });
  const whistles = [playWhistle1, playWhistle2, playWhistle3, playWhistle4, playWhistle5];

  const [countdownTime, setCountdownTime] = useState(5000); //5 seconds
  const [countdownKey, setCountdownKey] = useState(0);
  let timeLeft = useCountdownMs(countdownTime, countdownKey);
  const [gameState, setGameState] = useState<GameState>(createGameState());
  const [isPlayer1AcceptingHandsInput, setIsPlayer1AcceptingHandsInput] = useState(false);
  const [isPlayer2AcceptingHandsInput, setIsPlayer2AcceptingHandsInput] = useState(false);
  const isGameOver = useRef<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const initialRenderRefs = useRef({
    isCancelled: false, // Ref for cancellation flag
    player1_freezeTimeout: null as NodeJS.Timeout | null,
    player2_freezeTimeout: null as NodeJS.Timeout | null,
    roundTimeouts: {
      drawTimeout: null as NodeJS.Timeout | null,
      endTimeout: null as NodeJS.Timeout | null,
      resolveTimeout: null as NodeJS.Timeout | null,
      resolveCallback: null as (() => void) | null,
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
    console.log(timeLeft);
    if (timeLeft == 0) {
      //start game after countdown
      doGame();
    }
  }, [timeLeft]);

  async function doGame() {
    console.log("doGame called");
    console.log(isGameOver.current);
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
                    isTooEarly: false,
                  },
                  player_2: {
                    hand: null,
                    time: null,
                    isTooEarly: false,
                  },
                },
                abilities: {
                  player_1: {
                    boughtFreeze: false,
                    boughtGamble: false,
                    boughtRunItBack: false,
                  },
                  player_2: {
                    boughtFreeze: false,
                    boughtGamble: false,
                    boughtRunItBack: false,
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
      const resolveCallback = () => {
        if (isGameOver.current || initialRenderRefs.current.isCancelled) endGame();
        resolve();
      };

      const resolveTimeout = setTimeout(resolveCallback, (endTime + 3) * 1000);

      initialRenderRefs.current.roundTimeouts = {
        drawTimeout,
        endTimeout,
        resolveTimeout,
        resolveCallback,
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
    // initialRenderRefs.current.roundTimeouts = {
    //   drawTimeout: null,
    //   endTimeout: null,
    //   resolveTimeout: null,
    // }; // Clear the ref
  }

  function clearFreezeTimeouts() {
    if (initialRenderRefs.current.player1_freezeTimeout) {
      clearTimeout(initialRenderRefs.current.player1_freezeTimeout);
    }
    if (initialRenderRefs.current.player2_freezeTimeout) {
      clearTimeout(initialRenderRefs.current.player2_freezeTimeout);
    }
  }

  function playWhistle() {
    let whistleIndex = Math.floor(Math.random() * 5);
    whistles[whistleIndex]();
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
    setIsPlayer1AcceptingHandsInput(true);
    setIsPlayer2AcceptingHandsInput(true);
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
    setIsPlayer1AcceptingHandsInput(false);
    setIsPlayer2AcceptingHandsInput(false);
  }

  function updateGameStateAfterRound() {
    setGameState((prev: GameState) => {
      console.log("updateGameStateAfterRound", prev);
      let p1Score = 0;
      let p2Score = 0;
      let p1PP = 0;
      let p2PP = 0;
      let tempNumRoundsToWin = prev.game.header.numRoundsToWin;
      let tempHasRunItBack;

      prev.game.rounds.forEach((round) => {
        let player1 = round.hands.player_1;
        let player2 = round.hands.player_2;
        let tempP1Score: number, tempP2Score: number;
        let tempP1PP: number, tempP2PP: number;

        ({ player1Score: tempP1Score, player2Score: tempP2Score } = getScoreAward(player1, player2));
        p1Score += tempP1Score;
        p2Score += tempP2Score;

        ({ player1PP: tempP1PP, player2PP: tempP2PP } = getPurplePointsAward(player1, player2));
        p1PP += tempP1PP;
        p2PP += tempP2PP;

        if (round.abilities.player_1.boughtFreeze) p1PP--;
        if (round.abilities.player_1.boughtGamble) p1PP--;
        if (round.abilities.player_1.boughtRunItBack) p1PP--;
        if (round.abilities.player_2.boughtFreeze) p2PP--;
        if (round.abilities.player_2.boughtGamble) p2PP--;
        if (round.abilities.player_2.boughtRunItBack) p2PP--;
      });

      let standing =
        p1Score + p1PP == prev.game.header.numRoundsToWin ? { winner: "1", loser: "2" } : { winner: "2", loser: "1" };
      let isGamePoint = standing.winner == "1" ? p1Score + p1PP : p2Score + p2PP == prev.game.header.numRoundsToWin - 1;
      tempHasRunItBack = prev.game.header[`player${standing.loser}_hasRunItBack`];
      if (isGamePoint && tempHasRunItBack) {
        //its game point
        console.log("runItBack triggered");
        tempHasRunItBack = false;
        tempNumRoundsToWin = prev.game.header.numRoundsToWin + 2;
      } else if (p1Score + p1PP >= tempNumRoundsToWin || p2Score + p2PP >= tempNumRoundsToWin) {
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
            [`player${standing.loser}_hasRunItBack`]: tempHasRunItBack,
            numRoundsToWin: tempNumRoundsToWin,
          },
        },
      };
    });
  }

  function getPurplePointsAward(player1, player2): { player1PP: number; player2PP: number } {
    let award = { player1PP: 0, player2PP: 0 };
    if (player1.hand !== null || player2.hand !== null) {
      // someone played a hand
      if (player1.time !== null && player2.time == null) award.player1PP++;
      else if (player1.time == null && player2.time !== null) award.player2PP++;
      else if (player1.time < player2.time) award.player1PP++;
      else if (player1.time > player2.time) award.player2PP++;
    } else if (player1.isTooEarly || player2.isTooEarly) {
      //no one played a hand, so did someone jump the gun
      player1.isTooEarly ? award.player2PP++ : award.player1PP++;
    }
    console.log("getPurplePoints ", award);
    return award;
  }

  function getScoreAward(player1, player2): { player1Score: number; player2Score: number } {
    let award = { player1Score: 0, player2Score: 0 };
    if (player1.hand !== null || player2.hand !== null) {
      //if someone played a hand
      if (player1.hand !== player2.hand) {
        if (player1.hand == null) {
          award.player2Score++;
        } else if (player2.hand == null) {
          award.player1Score++;
        } else if (player1.hand === EMOJIS.ROCK && player2.hand === EMOJIS.SCISSORS) {
          award.player1Score++;
        } else if (player1.hand === EMOJIS.PAPER && player2.hand === EMOJIS.ROCK) {
          award.player1Score++;
        } else if (player1.hand === EMOJIS.SCISSORS && player2.hand === EMOJIS.PAPER) {
          award.player1Score++;
        } else {
          award.player2Score++;
        }
      }
    }
    return award;
  }

  function endGame() {
    setShowGameOverModal(true);
  }

  const playHand = useCallback(
    (hand, isPlayer1) => {
      if ((isPlayer1 && !isPlayer1AcceptingHandsInput) || (!isPlayer1 && !isPlayer2AcceptingHandsInput)) return;
      let now = Date.now();
      // console.log(gameState);
      let roundStartTime = gameState.game.rounds[gameState.game.rounds.length - 1].startTime;
      let roundDrawTime = gameState.game.rounds[gameState.game.rounds.length - 1].drawTime;
      let roundEndTime = gameState.game.rounds[gameState.game.rounds.length - 1].endTime;

      let playerKey = isPlayer1 ? "player_1" : "player_2";

      // someone jumped the gun
      if (now > roundStartTime && now < roundDrawTime) {
        console.log(playerKey + " jumped the gun");
        setViewModel((prev: QuickdrawArenaViewModel) => {
          return isPlayer1 ? { ...prev, player1_hand: EMOJIS.EARLY } : { ...prev, player2_hand: EMOJIS.EARLY };
        });
        setGameState((prev: GameState) => {
          return {
            ...prev,
            game: {
              ...prev.game,
              rounds: prev.game.rounds.map((round, index) => {
                if (index === prev.game.rounds.length - 1) {
                  return {
                    ...round,
                    hands: {
                      ...round.hands,
                      [playerKey]: { ...round.hands[playerKey], isTooEarly: true },
                    },
                  };
                } else {
                  return { ...round };
                }
              }),
            },
          };
        });
        goodBadUglyAudio.stop();
        playWhistle();
        clearRoundTimeouts();
        setIsPlayer1AcceptingHandsInput(false);
        setIsPlayer2AcceptingHandsInput(false);
        setTimeout(initialRenderRefs.current.roundTimeouts.resolveCallback, 2000);
        updateGameStateAfterRound();
        return;
      }
      //someone played legally
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
                  return round.hands[playerKey].time
                    ? { ...round, hands: { ...round.hands, [playerKey]: { ...round.hands[playerKey], hand: hand } } }
                    : {
                        ...round,
                        hands: { ...round.hands, [playerKey]: { ...round.hands[playerKey], hand: hand, time: now } },
                      };

                  // return isPlayer1
                  //   ? { ...round, hands: { ...round.hands, player_1: { hand: hand, time: now } } }
                  //   : { ...round, hands: { ...round.hands, player_2: { hand: hand, time: now } } };
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
    [viewModel, setViewModel, gameState, setGameState, isPlayer1AcceptingHandsInput, isPlayer2AcceptingHandsInput]
  );

  function buyAbility(isPlayer1, ability) {
    if (isPlayer1) {
      setGameState((prev: GameState) => {
        console.log("buy ability ", prev);
        if (prev.game.header.player1_purplePoints >= 1) {
          if (!prev.game.header[`player1_has${ability}`]) {
            return {
              ...prev,
              game: {
                ...prev.game,
                header: { ...prev.game.header, [`player1_has${ability}`]: true },
                rounds: prev.game.rounds.map((round, index) => {
                  if (index === prev.game.rounds.length - 1) {
                    return {
                      ...round,
                      abilities: {
                        ...round.abilities,
                        player_1: { ...round.abilities.player_1, [`bought${ability}`]: true },
                      },
                    };
                  } else {
                    return { ...round };
                  }
                }),
              },
            };
          }
        }
        return { ...prev };
      });
    } else {
      setGameState((prev: GameState) => {
        console.log(prev);
        if (prev.game.header.player2_purplePoints >= 1) {
          if (!prev.game.header[`player2_has${ability}`]) {
            return {
              ...prev,
              game: {
                ...prev.game,
                header: { ...prev.game.header, [`player2_has${ability}`]: true },
                rounds: prev.game.rounds.map((round, index) => {
                  if (index === prev.game.rounds.length - 1) {
                    return {
                      ...round,
                      abilities: {
                        ...round.abilities,
                        player_2: { ...round.abilities.player_2, [`bought${ability}`]: true },
                      },
                    };
                  } else {
                    return { ...round };
                  }
                }),
              },
            };
          }
        }
        return { ...prev };
      });
    }
  }

  function doFreeze(isPlayer1) {
    setGameState((prev: GameState) => {
      if (isPlayer1) {
        if (prev.game.header.player1_hasFreeze) {
          setIsPlayer2AcceptingHandsInput(false);
          initialRenderRefs.player2_freezeTimeout = setTimeout(() => {
            setIsPlayer2AcceptingHandsInput(true);
          }, 2000);
          return { ...prev, game: { ...prev.game, header: { ...prev.game.header, player1_hasFreeze: false } } };
        }
        return { ...prev };
      } else {
        if (prev.game.header.player2_hasFreeze) {
          setIsPlayer1AcceptingHandsInput(false);
          initialRenderRefs.player1_freezeTimeout = setTimeout(() => {
            setIsPlayer1AcceptingHandsInput(true);
          }, 2000);
        }
        return { ...prev, game: { ...prev.game, header: { ...prev.game.header, player2_hasFreeze: false } } };
      }
      return { ...prev };
    });
  }

  function doGamble(isPlayer1) {
    setGameState((prev: GameState) => {
      if (prev.game.header[`player${isPlayer1 ? 1 : 2}_hasGamble`]) {
      }
    });
  }

  function doRunItBack(isPlayer1) {
  }

  //update display score when state changes
  useEffect(() => {
    setViewModel((prev) => {
      return {
        ...prev,
        numRoundsToWin: gameState.game.header.numRoundsToWin,
        player1_score: gameState.game.header.player1_score,
        player1_purplePoints: gameState.game.header.player1_purplePoints,
        player1_hasFreeze: gameState.game.header.player1_hasFreeze,
        player1_hasGamble: gameState.game.header.player1_hasGamble,
        player1_hasRunItBack: gameState.game.header.player1_hasRunItBack,
        player2_score: gameState.game.header.player2_score,
        player2_purplePoints: gameState.game.header.player2_purplePoints,
        player2_hasFreeze: gameState.game.header.player2_hasFreeze,
        player2_hasGamble: gameState.game.header.player2_hasGamble,
        player2_hasRunItBack: gameState.game.header.player2_hasRunItBack,
      };
    });
  }, [
    gameState.game.header.numRoundsToWin,
    gameState.game.header.player1_score,
    gameState.game.header.player1_purplePoints,
    gameState.game.header.player1_hasFreeze,
    gameState.game.header.player1_hasGamble,
    gameState.game.header.player1_hasRunItBack,
    gameState.game.header.player2_score,
    gameState.game.header.player2_purplePoints,
    gameState.game.header.player2_hasFreeze,
    gameState.game.header.player2_hasGamble,
    gameState.game.header.player2_hasRunItBack,
  ]);

  //updatePurplePoints when there is an ability purchase
  useEffect(() => {
    //only execute when purchasing, dont want to update score when abilities are consumed

    setGameState((prev: GameState) => {
      let p1PP = 0;
      let p2PP = 0;
      console.log("PP UseEffect: prev ", prev);
      prev.game.rounds.forEach((round, index) => {
        let tempP1PP: number, tempP2PP: number;
        ({ player1PP: tempP1PP, player2PP: tempP2PP } = getPurplePointsAward(
          round.hands.player_1,
          round.hands.player_2
        ));
        p1PP += tempP1PP;
        p2PP += tempP2PP;

        if (round.abilities.player_1.boughtFreeze) p1PP--;
        if (round.abilities.player_1.boughtGamble) p1PP--;
        if (round.abilities.player_1.boughtRunItBack) p1PP--;
        if (round.abilities.player_2.boughtFreeze) p2PP--;
        if (round.abilities.player_2.boughtGamble) p2PP--;
        if (round.abilities.player_2.boughtRunItBack) p2PP--;
      });

      return {
        ...prev,
        game: {
          ...prev.game,
          header: {
            ...prev.game.header,
            player1_purplePoints: p1PP,
            player2_purplePoints: p2PP,
          },
        },
      };
    });
  }, [gameState.game.rounds]);

  //register keydown event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "q") {
        playHand(EMOJIS.ROCK, true);
      } else if (event.key === "w") {
        playHand(EMOJIS.PAPER, true);
      } else if (event.key === "e") {
        playHand(EMOJIS.SCISSORS, true);
      } else if (event.key === "1" && event.location == 0) {
        doFreeze(true);
      } else if (event.key === "ArrowLeft") {
        playHand(EMOJIS.ROCK, false);
      } else if (event.key === "ArrowDown") {
        playHand(EMOJIS.PAPER, false);
      } else if (event.key === "ArrowRight") {
        playHand(EMOJIS.SCISSORS, false);
      } else if (event.key === "0" && event.location == 3) {
        doFreeze(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playHand]);

  //clear all things when leaving game
  useEffect(() => {
    return () => {
      initialRenderRefs.current.isCancelled = true; // Set the flag when the component unmounts
      clearRoundTimeouts(); // Clear any pending timeouts
      clearFreezeTimeouts();
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
        <button
          onClick={() => {
            doFreeze(true);
          }}
        >
          doFreeze
        </button>
      </div>
    );
  };

  return (
    <>
      {testView()}
      <QuickdrawArenaView
        localOrOnline="Local"
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
          Quit: () => {
            initialRenderRefs.current.isCancelled = true;
            clearRoundTimeouts();
            goodBadUglyAudio.stop();
            gunshotAudio.stop();
            drumrollAudio.stop();
            setDisplayState("Home");
          },
          PlayAgain: () => {
            //not sure what all is necessary here but were gonna be careful
            console.log("PlayAgain Called");
            setShowGameOverModal(false);
            setViewModel(initialViewModel);
            setGameState(createGameState());
            setIsPlayer1AcceptingHandsInput(false);
            setIsPlayer1AcceptingHandsInput(false);
            clearRoundTimeouts();
            clearFreezeTimeouts();
            isGameOver.current = false;
            // Reset all audio
            goodBadUglyAudio.stop();
            gunshotAudio.stop();
            drumrollAudio.stop();
            // Reset countdown
            setCountdownTime(5000);
            setCountdownKey((prev) => prev + 1);
          },
          BuyFreeze: (isPlayer1) => {
            buyAbility(isPlayer1, "Freeze");
          },
          BuyGamble: (isPlayer1) => {
            buyAbility(isPlayer1, "Gamble");
          },
          BuyRunItBack: (isPlayer1) => {
            buyAbility(isPlayer1, "RunItBack");
          },
        }}
        setMainDisplayState={setDisplayState}
        quickdrawSessionData={quickdrawSessionData}
        showGameOverModal={showGameOverModal}
        setShowGameOverModal={setShowGameOverModal}
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
      player1_hasFreeze: boolean;
      player1_hasGamble: boolean;
      player1_hasRunItBack: boolean;
      player2_score: number;
      player2_purplePoints: number;
      player2_hasFreeze: boolean;
      player2_hasGamble: boolean;
      player2_hasRunItBack: boolean;
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
        player1_hasFreeze: false,
        player1_hasGamble: false,
        player1_hasRunItBack: false,
        player2_score: 0,
        player2_purplePoints: 0,
        player2_hasFreeze: false,
        player2_hasGamble: false,
        player2_hasRunItBack: false,
      },
      rounds: [],
    },
  };

  //logger.info(shellObject);
  return gameState;
}
