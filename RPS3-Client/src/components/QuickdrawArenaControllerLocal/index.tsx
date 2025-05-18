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
import { big, p } from "motion/react-client";

export default function QuickdrawArenaControllerLocal({ setDisplayState, quickdrawSessionData, soundVolume }) {
  //View
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
    player1WonLastGame: null,
    player1_winCount:
      localStorage.getItem(quickdrawSessionData.player1.username) == null
        ? 0
        : JSON.parse(localStorage.getItem(quickdrawSessionData.player1.username)).winCount,
    player2_winCount:
      localStorage.getItem(quickdrawSessionData.player2.username) == null
        ? 0
        : JSON.parse(localStorage.getItem(quickdrawSessionData.player2.username)).winCount,
  };
  const [viewModel, setViewModel] = useState<QuickdrawArenaViewModel>(initialViewModel);
  const [isLeftShopOpen, setIsLeftShopOpen] = useState(false);
  const [isRightShopOpen, setIsRightShopOpen] = useState(false);
  const [isLeftGambling, setIsLeftGambling] = useState(false);
  const [isRightGambling, setIsRightGambling] = useState(false);

  // Audio
  const [playGoodBadUglyAudio, goodBadUglyAudio] = useSound(GoodBadAndUglyURL, {
    volume: soundVolume,
  });
  const [playGunshot, gunshotAudio] = useSound(GunshotURL, { volume: soundVolume });
  const [playDrumroll, drumrollAudio] = useSound(DrumrollURL, { volume: soundVolume });
  const [playWhistle1, whistle1Audio] = useSound(Whistle1URL, { volume: soundVolume });
  const [playWhistle2, whistle2Audio] = useSound(Whistle2URL, { volume: soundVolume });
  const [playWhistle3, whistle3Audio] = useSound(Whistle3URL, { volume: soundVolume });
  const [playWhistle4, whistle4Audio] = useSound(Whistle4URL, { volume: soundVolume });
  const [playWhistle5, whistle5Audio] = useSound(Whistle5URL, { volume: soundVolume });
  const whistles = [playWhistle1, playWhistle2, playWhistle3, playWhistle4, playWhistle5];

  //Countdown
  const [countdownTime, setCountdownTime] = useState(2000); //5 seconds
  const [countdownKey, setCountdownKey] = useState(0);
  let timeLeft = useCountdownMs(countdownTime, countdownKey);

  //GameState
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

  //start game when countdown is over
  useEffect(() => {
    // console.log(localStorage);
    if (timeLeft == 0) {
      //start game after countdown
      doGame();
    }
  }, [timeLeft]);

  //game loop, initializes players in localstorage then calls doRound until the game is over
  async function doGame() {
    // console.log("doGame called");
    // console.log("isGameOver", isGameOver.current);
    createPlayersInLocalStorage(quickdrawSessionData.player1.username, quickdrawSessionData.player2.username);
    initialRenderRefs.current.isCancelled = false; // Reset the flag when starting a new game
    while (isGameOver.current == false) {
      await doRound();
    }
  }

  //creates the new round object, kicks off the game phase timeouts, and resolves its promise when the round is over
  //update gamestate occurs after the pow, or endphase
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
        let p1CarryOver = { gamble: null, time: null };
        let p2CarryOver = { gamble: null, time: null };
        if (prev.game.carryOver.player_1.gamble && prev.game.carryOver.player_1.time < now) {
          p1CarryOver = prev.game.carryOver.player_1;
        }
        if (prev.game.carryOver.player_2.gamble && prev.game.carryOver.player_1.time < now) {
          p2CarryOver = prev.game.carryOver.player_2;
        }

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
                    activeGamble: p1CarryOver.gamble,
                    activeGambleTime: p1CarryOver.time,
                    boughtRunItBack: false,
                  },
                  player_2: {
                    boughtFreeze: false,
                    boughtGamble: false,
                    activeGamble: p2CarryOver.gamble,
                    activeGambleTime: p2CarryOver.time,
                    boughtRunItBack: false,
                  },
                },
              },
            ],
            carryOver: {
              player_1: { gamble: null, time: null },
              player_2: { gamble: null, time: null },
            },
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
        // console.log("resolveCallback called", isGameOver.current, initialRenderRefs.current.isCancelled);
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
      // console.log("clearing resolveTimeout");
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

  //sets viewModel to start phase, plays audio and enables playing hands
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

  //sets viewModel to draw phase, plays audio
  function beginDrawPhase() {
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, gamePhase: GamePhases.DRAW, titleText: EMOJIS.BOMB };
    });
    goodBadUglyAudio.stop();
    playGunshot();
    playDrumroll();
  }

  //sets viewModel to end phase, plays audio and disables playing hands
  function beginEndPhase() {
    setViewModel((prev: QuickdrawArenaViewModel) => {
      return { ...prev, gamePhase: GamePhases.END, titleText: EMOJIS.POW };
    });
    playGunshot();
    drumrollAudio.stop();
    setIsPlayer1AcceptingHandsInput(false);
    setIsPlayer2AcceptingHandsInput(false);
  }

  //updates the game state after a round, calculates scores and purple points, and checks for game over conditions
  function updateGameStateAfterRound() {
    setGameState((prev: GameState) => {
      // console.log("updateGameStateAfterRound", prev);
      let p1Score = 0;
      let p2Score = 0;
      let p1PP = 0;
      let p2PP = 0;
      let tempNumRoundsToWin = prev.game.header.numRoundsToWin;
      let tempHasRunItBack;
      // let p1CarryOver = { gamble: null, time: null };
      // let p2CarryOver = { gamble: null, time: null };

      //did anything happen in the round?
      const roundBeforeLast = prev.game.rounds[prev.game.rounds.length - 2]; //only way to know if ability was bought is to check the round before last
      const latestRound = prev.game.rounds[prev.game.rounds.length - 1];
      if (prev.game.rounds.length > 1 && !didAnythingHappenThisRound(roundBeforeLast, latestRound)) {
        //if nothing happened, delete the round and return, dont want to have a billion rounds looping to process if the user goes afk
        // console.log("prev.rounds", prev.game.rounds);
        let newRounds = prev.game.rounds.slice(0, -1);
        // console.log("new rounds", newRounds);
        return { ...prev, game: { ...prev.game, rounds: [...newRounds] } };
      }

      prev.game.rounds.forEach((round) => {
        let player1Hand = round.hands.player_1;
        let player2Hand = round.hands.player_2;
        let player1Abilities = round.abilities.player_1;
        let player2Abilities = round.abilities.player_2;
        let tempP1Score: number, tempP2Score: number;
        let tempP1PP: number, tempP2PP: number;

        ({ player1Score: tempP1Score, player2Score: tempP2Score } = getScoreAward(
          player1Hand,
          player1Abilities,
          player2Hand,
          player2Abilities
        ));
        p1Score += tempP1Score;
        p2Score += tempP2Score;

        ({ player1PP: tempP1PP, player2PP: tempP2PP } = getPurplePointsAward(player1Hand, player2Hand));
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
        endGame(standing.winner);
      }

      return {
        ...prev,
        game: {
          ...prev.game,
          header: {
            ...prev.game.header,
            player1_score: p1Score,
            player1_purplePoints: p1PP,
            player1_activeGamble: false,
            player1_hasGamble: false,
            player2_score: p2Score,
            player2_purplePoints: p2PP,
            player2_activeGamble: false,
            player2_hasGamble: false,
            [`player${standing.loser}_hasRunItBack`]: tempHasRunItBack,
            numRoundsToWin: tempNumRoundsToWin,
          },
        },
      };
    });
  }

  //determines if the round is useful for determining the gamestate, other wise will be discarded
  function didAnythingHappenThisRound(roundBeforeLast: Round, latestRound: Round): Boolean {
    let lastRoundAbilities = roundBeforeLast.abilities;
    let thisRoundAbilities = latestRound.abilities;
    //if any player has purchased an ability
    if (
      lastRoundAbilities.player_1.boughtFreeze !== thisRoundAbilities.player_1.boughtFreeze ||
      lastRoundAbilities.player_1.boughtGamble !== thisRoundAbilities.player_1.boughtGamble ||
      lastRoundAbilities.player_1.boughtRunItBack !== thisRoundAbilities.player_1.boughtRunItBack ||
      lastRoundAbilities.player_2.boughtFreeze !== thisRoundAbilities.player_2.boughtFreeze ||
      lastRoundAbilities.player_2.boughtGamble !== thisRoundAbilities.player_2.boughtGamble ||
      lastRoundAbilities.player_2.boughtRunItBack !== thisRoundAbilities.player_2.boughtRunItBack
      // roundBeforeLast.abilities.player_1.activeGamble ||
      // roundBeforeLast.abilities.player_2.activeGamble
      //this is not efficient but whatever, ideally we would check the header to see if there is a carry over but since we only have last round and i dont want to change the params,
      //any round that comes after a gamble has been played is kept even if nothing happens. This is not going to affect the main goal which is preventing infinite rounds accruing during afk.
      // Unless the carry over is broken and every round is now the round after a gamble, so dont do that.
    )
      return true;
    // if any player has played a hand
    if (
      latestRound.hands.player_1.hand ||
      latestRound.hands.player_2.hand ||
      latestRound.hands.player_1.isTooEarly ||
      latestRound.hands.player_2.isTooEarly
    ) {
      return true;
    }
    return false;
  }

  //calculates the purple points award based on the players hands
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
    // console.log("getPurplePoints ", award);
    return award;
  }

  //calculates the score award based on the players hands
  function getScoreAward(
    player1,
    player1Abilities,
    player2,
    player2Abilities
  ): { player1Score: number; player2Score: number } {
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
      if (player1Abilities.activeGamble && player1Abilities.activeGamble == player2.hand) {
        award.player1Score += 2;
      }
      if (player2Abilities.activeGamble && player2Abilities.activeGamble == player1.hand) {
        award.player2Score += 2;
      }
    }
    return award;
  }

  //shows the game over modal
  function endGame(winner: "1" | "2") {
    if (isGameOver.current) return;
    console.log("endGame called");
    clearRoundTimeouts();
    clearFreezeTimeouts();
    let winnerStoredUser = localStorage.getItem(quickdrawSessionData[`player${winner}`].username);
    let previousWinCount = JSON.parse(winnerStoredUser).winCount;
    //need to make sure the player is initialized when the game begins
    localStorage.setItem(
      quickdrawSessionData[`player${winner}`].username,
      JSON.stringify({
        winCount: previousWinCount + 1,
      })
    );
    setShowGameOverModal(true);
    setViewModel((prev: QuickdrawArenaViewModel) => {
      console.log(winner == "1" ? true : false);
      return {
        ...prev,
        [`player${winner}_winCount`]: previousWinCount + 1,
        player1WonLastGame: winner == "1" ? true : false,
      };
    });
    isGameOver.current = true;
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
                      [playerKey]: { ...round.hands[playerKey], time: now, isTooEarly: true },
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
        let resolveTimeout = setTimeout(initialRenderRefs.current.roundTimeouts.resolveCallback, 2000);
        initialRenderRefs.current.roundTimeouts.resolveTimeout = resolveTimeout;
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
    // console.log("buy ability called");
    if (isPlayer1) {
      setGameState((prev: GameState) => {
        // console.log("buyability P1", prev);
        if (prev.game.header.player1_purplePoints >= 1) {
          if (ability == "Gamble") setIsLeftGambling(true);
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
        // console.log("buyability P2", prev)
        // console.log(prev);
        if (prev.game.header.player2_purplePoints >= 1) {
          if (ability == "Gamble") setIsRightGambling(true);
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

  function doGamble(isPlayer1, hand) {
    // console.log("doGamble", isPlayer1, hand);
    if (isPlayer1) {
      setGameState((prev: GameState) => {
        return {
          ...prev,
          game: {
            ...prev.game,
            header: { ...prev.game.header, player1_activeGamble: true },
            rounds: prev.game.rounds.map((round, index) => {
              if (index === prev.game.rounds.length - 1) {
                return {
                  ...round,
                  abilities: {
                    ...round.abilities,
                    player_1: { ...round.abilities.player_1, activeGamble: hand, activeGambleTime: Date.now() },
                  },
                };
              } else {
                return { ...round };
              }
            }),
          },
        };
      });
      setIsLeftGambling(false);
    } else {
      setGameState((prev: GameState) => {
        return {
          ...prev,
          game: {
            ...prev.game,
            header: { ...prev.game.header, player2_activeGamble: true },
            rounds: prev.game.rounds.map((round, index) => {
              if (index === prev.game.rounds.length - 1) {
                return {
                  ...round,
                  abilities: {
                    ...round.abilities,
                    player_2: { ...round.abilities.player_2, activeGamble: hand },
                  },
                };
              } else {
                return { ...round };
              }
            }),
          },
        };
      });
      setIsRightGambling(false);
    }
  }

  function createPlayersInLocalStorage(player1Username: string, player2Username: string) {
    // console.log(localStorage.getItem(player1Username));
    // console.log(typeof localStorage.getItem(player2Username));
    const player1 = localStorage.getItem(player1Username);
    const player2 = localStorage.getItem(player2Username);
    if (player1 == null) {
      console.log("player1 is not found, creating new player");
      localStorage.setItem(player1Username, JSON.stringify({ winCount: 0 }));
      addUsernameToLocalStorage(player1Username);
    } else {
      //get player data and do stuff
    }

    if (player2 == null) {
      console.log("player2 is not found, creating new player");
      localStorage.setItem(player2Username, JSON.stringify({ winCount: 0 }));
      addUsernameToLocalStorage(player2Username);
    } else {
      //get player data and do stuff
    }
  }

  function addUsernameToLocalStorage(username: string) {
    //if player names themselves the value of a localStorage variable, they can hack the game
    let localPlayerUsernames = localStorage.getItem("localPlayerUsernames");
    let localPlayerUsernamesArray;
    if (localPlayerUsernames !== null) {
      localPlayerUsernamesArray = JSON.parse(localPlayerUsernames);
      if (!localPlayerUsernamesArray.includes(username)) {
        localPlayerUsernamesArray.push(username);
        // console.log("localPlayerUsernamesArray", localPlayerUsernamesArray);
        localStorage.setItem("localPlayerUsernames", JSON.stringify(localPlayerUsernamesArray));
      }
    } else {
      localPlayerUsernamesArray = [username];
      // console.log("localPlayerUsernamesArray", localPlayerUsernamesArray);
      localStorage.setItem("localPlayerUsernames", JSON.stringify(localPlayerUsernamesArray));
    }
  }
  //update viewModel when gameState changes
  useEffect(() => {
    setViewModel((prev) => {
      return {
        ...prev,
        numRoundsToWin: gameState.game.header.numRoundsToWin,
        player1_score: gameState.game.header.player1_score,
        player1_purplePoints: gameState.game.header.player1_purplePoints,
        player1_hasFreeze: gameState.game.header.player1_hasFreeze,
        player1_hasGamble: gameState.game.header.player1_hasGamble,
        player1_activeGamble: gameState.game.header.player1_activeGamble,
        player1_hasRunItBack: gameState.game.header.player1_hasRunItBack,
        player2_score: gameState.game.header.player2_score,
        player2_purplePoints: gameState.game.header.player2_purplePoints,
        player2_hasFreeze: gameState.game.header.player2_hasFreeze,
        player2_hasGamble: gameState.game.header.player2_hasGamble,
        player2_activeGamble: gameState.game.header.player2_activeGamble,
        player2_hasRunItBack: gameState.game.header.player2_hasRunItBack,
      };
    });
  }, [
    gameState.game.header.numRoundsToWin,
    gameState.game.header.player1_score,
    gameState.game.header.player1_purplePoints,
    gameState.game.header.player1_hasFreeze,
    gameState.game.header.player1_hasGamble,
    gameState.game.header.player1_activeGamble,
    gameState.game.header.player1_hasRunItBack,
    gameState.game.header.player2_score,
    gameState.game.header.player2_purplePoints,
    gameState.game.header.player2_hasFreeze,
    gameState.game.header.player2_hasGamble,
    gameState.game.header.player2_activeGamble,
    gameState.game.header.player2_hasRunItBack,
  ]);

  //updatePurplePoints when there is an ability purchase
  //handle carry over when gambling after jumped gun or after a round ends (pow)
  useEffect(() => {
    //only execute when purchasing, dont want to update score when abilities are consumed

    setGameState((prev: GameState) => {
      let p1PP = 0;
      let p2PP = 0;
      let tempCarryOver = prev.game.carryOver;
      // console.log("RoundChanged UseEffect: prev ", prev);

      // gambling after the pow
      if (prev.game.rounds.length > 0) {
        let currentRound = prev.game.rounds[prev.game.rounds.length - 1];
        // console.log(currentRound);
        if (
          currentRound.abilities.player_1.activeGamble &&
          currentRound.abilities.player_1.activeGambleTime > currentRound.endTime
        ) {
          tempCarryOver.player_1.gamble = currentRound.abilities.player_1.activeGamble;
          tempCarryOver.player_1.time = currentRound.abilities.player_1.activeGambleTime;
        }

        if (
          currentRound.abilities.player_2.activeGamble &&
          currentRound.abilities.player_2.activeGambleTime > currentRound.endTime
        ) {
          tempCarryOver.player_2.gamble = currentRound.abilities.player_2.activeGamble;
          tempCarryOver.player_2.time = currentRound.abilities.player_2.activeGambleTime;
        }

        //gambling after a jumped gun
        if (
          currentRound.abilities.player_1.activeGamble &&
          currentRound.hands.player_2.isTooEarly &&
          currentRound.abilities.player_1.activeGambleTime > currentRound.hands.player_2.time
        ) {
          tempCarryOver.player_1.gamble = currentRound.abilities.player_1.activeGamble;
          tempCarryOver.player_1.time = currentRound.abilities.player_1.activeGambleTime;
        }
        if (
          currentRound.abilities.player_2.activeGamble &&
          currentRound.hands.player_1.isTooEarly &&
          currentRound.abilities.player_2.activeGambleTime > currentRound.hands.player_1.time
        ) {
          tempCarryOver.player_2.gamble = currentRound.abilities.player_2.activeGamble;
          tempCarryOver.player_2.time = currentRound.abilities.player_2.activeGambleTime;
        }
      }

      // console.log("tempCarryOver", tempCarryOver);

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
          carryOver: {
            player_1: { ...tempCarryOver.player_1 },
            player_2: { ...tempCarryOver.player_2 },
          },
        },
      };
    });
  }, [gameState.game.rounds]);

  //register keydown event listener
  useEffect(() => {
    function bigButtons(isPlayer1: Boolean, isShopOpen: Boolean, isGambling: Boolean, hand, ability) {
      // console.log("bigButtons called");
      // console.log(isPlayer1, isShopOpen, isGambling, hand, ability);
      if (isGambling) {
        doGamble(isPlayer1, hand);
      } else if (isShopOpen) {
        buyAbility(isPlayer1, ability);
      } else {
        playHand(hand, isPlayer1);
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.repeat) return; // Ignore repeated key presses
      // console.log("Key pressed Logic: ", event.code);
      //Player 1
      if (event.code === "KeyQ") {
        bigButtons(true, isLeftShopOpen, isLeftGambling, EMOJIS.ROCK, "Freeze");
      } else if (event.code === "KeyW") {
        bigButtons(true, isLeftShopOpen, isLeftGambling, EMOJIS.PAPER, "Gamble");
      } else if (event.code === "KeyE") {
        bigButtons(true, isLeftShopOpen, isLeftGambling, EMOJIS.SCISSORS, "RunItBack");
      } else if (event.code === "Tab") {
        setIsLeftShopOpen((prev) => !prev);
      } else if (event.code === "Digit1") {
        doFreeze(true);
        //Player 2
      } else if (event.code === "ArrowLeft") {
        bigButtons(false, isRightShopOpen, isRightGambling, EMOJIS.ROCK, "Freeze");
      } else if (event.code === "ArrowDown") {
        bigButtons(false, isRightShopOpen, isRightGambling, EMOJIS.PAPER, "Gamble");
      } else if (event.code === "ArrowRight") {
        bigButtons(false, isRightShopOpen, isRightGambling, EMOJIS.SCISSORS, "RunItBack");
      } else if (event.code === "ArrowUp") {
        doFreeze(false);
      } else if (event.code === "ShiftRight") {
        setIsRightShopOpen((prev) => !prev);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.code === "Tab") {
        setIsLeftShopOpen(false);
      } else if (event.code === "ShiftRight") {
        setIsRightShopOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playHand, isRightShopOpen, isLeftShopOpen, isLeftGambling, isRightGambling]);

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

  return (
    <>
      <QuickdrawArenaView
        localOrOnline="Local"
        viewModel={viewModel}
        onClicks={{
          Rock: (isPlayer1) => {
            playHand(EMOJIS.ROCK, isPlayer1);
          },
          Paper: (isPlayer1) => {
            playHand(EMOJIS.PAPER, isPlayer1);
          },
          Scissors: (isPlayer1) => {
            playHand(EMOJIS.SCISSORS, isPlayer1);
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
            setViewModel({ ...initialViewModel, player1WonLastGame: viewModel.player1WonLastGame });
            setGameState(createGameState());
            setIsPlayer1AcceptingHandsInput(false);
            setIsPlayer1AcceptingHandsInput(false);
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
        isLeftShopOpen={isLeftShopOpen}
        setIsLeftShopOpen={setIsLeftShopOpen}
        isLeftGambling={isLeftGambling}
        isRightShopOpen={isRightShopOpen}
        setIsRightShopOpen={setIsRightShopOpen}
        isRightGambling={isRightGambling}
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
      player1_activeGamble: boolean;
      player1_hasRunItBack: boolean;
      player2_score: number;
      player2_purplePoints: number;
      player2_hasFreeze: boolean;
      player2_hasGamble: boolean;
      player2_activeGamble: boolean;
      player2_hasRunItBack: boolean;
    };
    rounds?: Array<Round>;
    carryOver: {
      player_1: {
        gamble: EMOJIS | null;
        time: number | null;
      };
      player_2: {
        gamble: EMOJIS | null;
        time: number | null;
      };
    };
  };
}

interface Round {
  abilities: {
    player_1: {
      boughtFreeze: boolean;
      boughtGamble: boolean;
      activeGamble: EMOJIS | null;
      activeGambleTime: number | null;
      boughtRunItBack: boolean;
    };
    player_2: {
      boughtFreeze: boolean;
      boughtGamble: boolean;
      activeGamble: EMOJIS | null;
      activeGambleTime: number | null;
      boughtRunItBack: boolean;
    };
  };
  hands: {
    player_1: {
      hand: string | null;
      time: number | null;
      isTooEarly: boolean;
    };
    player_2: {
      hand: string | null;
      time: number | null;
      isTooEarly: boolean;
    };
  };
  startTime: number;
  drawTime: number;
  endTime: number;
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
        player1_activeGamble: false,
        player1_hasRunItBack: false,
        player2_score: 0,
        player2_purplePoints: 0,
        player2_hasFreeze: false,
        player2_hasGamble: false,
        player2_activeGamble: false,
        player2_hasRunItBack: false,
      },
      rounds: [],
      carryOver: {
        player_1: { gamble: null, time: null },
        player_2: { gamble: null, time: null },
      },
    },
  };

  //logger.info(shellObject);
  return gameState;
}
