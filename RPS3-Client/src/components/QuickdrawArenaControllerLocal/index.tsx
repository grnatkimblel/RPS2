import { useEffect, useState } from "react";

import QuickdrawArenaView from "../QuickdrawArenaView";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";

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

  useEffect(() => {
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
            setViewModel((viewModel: QuickdrawArenaViewModel) => ({ ...viewModel, player1_hand: EMOJIS.ROCK }));
          },
          Paper: () => {
            setViewModel((viewModel: QuickdrawArenaViewModel) => ({ ...viewModel, player1_hand: EMOJIS.PAPER }));
          },
          Scissors: () => {
            setViewModel((viewModel: QuickdrawArenaViewModel) => ({ ...viewModel, player1_hand: EMOJIS.SCISSORS }));
          },
        }}
        setMainDisplayState={setDisplayState}
        quickdrawSessionData={quickdrawSessionData}
      />
    </>
  );
}
