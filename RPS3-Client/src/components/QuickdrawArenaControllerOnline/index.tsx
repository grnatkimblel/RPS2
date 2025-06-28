import { useEffect, useState } from "react";

import QuickdrawArenaView from "../QuickdrawArenaView";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";
import API_ROUTES from "../../enums/API_Routes";
import useCountdownMs from "../../hooks/useCountdownMs";

export default function QuickdrawArenaControllerOnline({
  setDisplayState,
  quickdrawSessionData,
  authorizeThenCallHttp,
}) {
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
  const timeTillGameStart = useCountdownMs(() => {
    const clientNow = Date.now();
    //client time should be more recent
    const clientServerDiff = clientNow - quickdrawSessionData.serverNow;
    if (clientServerDiff > 1000) {
      console.warn("Client time is more than 1 second ahead of server time, adjusting...");
      return quickdrawSessionData.gameStartTime - quickdrawSessionData.serverNow;
    } else {
      return quickdrawSessionData.gameStartTime - clientNow;
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyQ") {
      } else if (event.code === "KeyW") {
      } else if (event.code === "KeyE") {
      } else if (event.code === "ArrowLeft") {
      } else if (event.code === "ArrowDown") {
      } else if (event.code === "ArrowRight") {
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {});

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
