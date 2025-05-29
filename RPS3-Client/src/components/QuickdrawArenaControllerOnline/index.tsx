import { useEffect, useState } from "react";

import QuickdrawArenaView from "../QuickdrawArenaView";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";

export default function QuickdrawArenaControllerOnline({ setDisplayState, quickdrawSessionData }) {
  const [viewModel, setViewModel] = useState<QuickdrawArenaViewModel>({
    titleText: "RPS",
    gamePhase: GamePhases.PRE_GAME,
    numRoundsToWin: 3,
    player1_hand: EMOJIS.LEFT_HAND,
    player1_score: 0,
    player1_purplePoints: 0,
    player2_hand: EMOJIS.RIGHT_HAND,
    player2_score: 0,
    player2_purplePoints: 0,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "q") {
      } else if (event.key === "w") {
      } else if (event.key === "e") {
      } else if (event.key === "ArrowLeft") {
      } else if (event.key === "ArrowDown") {
      } else if (event.key === "ArrowRight") {
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <QuickdrawArenaView
      viewModel={viewModel}
      onClicks={{
        Rock: () => {
          setViewModel((viewModel: QuickdrawArenaViewModel) => ({ ...viewModel, player1_hand: EMOJIS.ROCK }));
        },
        Paper: () => {
          setViewModel((viewModel: QuickdrawArenaViewModel) => ({ ...viewModel, player1_hand: EMOJIS.PAPER }));
        },
        Scissors: () => {
          setViewModel((viewModel: QuickdrawArenaViewModel) => ({ ...viewModel, player1_hand: EMOJIS.SCISSORS }));
        },
        Quit: () => {
          // initialRenderRefs.current.isCancelled = true;
          // clearRoundTimeouts();
          // goodBadUglyAudio.stop();
          // gunshotAudio.stop();
          // drumrollAudio.stop();
          setDisplayState("Home");
        },
      }}
      setMainDisplayState={setDisplayState}
      quickdrawSessionData={quickdrawSessionData}
    />
  );
}
