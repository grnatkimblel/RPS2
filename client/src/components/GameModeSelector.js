import PAGES from "../enums/pages";
import { GAMEMODES, GAMEMODE_TYPES } from "../enums/gameEnums";

import { useState } from "react";

function GameModeSelector({
  gameModeType,
  bonusStyles,
  gameModeSetter,
  pageSetter,
}) {
  let setGameMode = (childGameMode) => {
    //console.log("setGamemode called");
    switch (gameModeType) {
      case GAMEMODE_TYPES.QUICKPLAY:
        //console.log("quickplay selected");
        gameModeSetter({
          gameModeType: gameModeType,
          gameMode: childGameMode,
        });
        break;

      case GAMEMODE_TYPES.RANKED:
        //console.log("ranked selected");
        gameModeSetter({
          gameModeType: gameModeType,
          gameMode: childGameMode,
        });
        break;
      default:
        console.log("GameModeSelector invalid case in switch");
    }
    pageSetter(PAGES.ONLINE.GAMEMODE_CHOSEN);
  };

  const [pageFlavor, setPageFlavor] = useState("");
  if (pageFlavor === "") {
    return (
      <button
        style={{ flex: 1 }}
        className={"defaultColor " + bonusStyles}
        onClick={() => setPageFlavor("Expanded")}
      >
        {gameModeType}
      </button>
    );
  }
  if (pageFlavor === "Expanded") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top */}

        <div className="gamemode-smalltext">{gameModeType}</div>

        <button
          style={{ flex: 1 }}
          className={
            gameModeType == GAMEMODE_TYPES.RANKED
              ? "bottomBorder notInteractableColor"
              : "bottomBorder defaultColor"
          }
          onClick={() => setGameMode(GAMEMODES.QUICKDRAW)}
        >
          Quickdraw
        </button>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            flex: 1,
          }}
        >
          <div style={{ flex: 1 }}>
            <div className="gamemode-smalltext">{gameModeType}</div>
            <button
              style={{ width: "100%", height: "100%" }}
              className={"notInteractableColor " + bonusStyles}
              onClick={() => setGameMode(GAMEMODES.TDM)}
            >
              TDM
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <div className="gamemode-smalltext">{gameModeType}</div>
            <button
              style={{ width: "100%", height: "100%" }}
              className={
                "notInteractableColor redTextBorder smooth-16 leftBorder " +
                bonusStyles
              }
              onClick={() => setGameMode(GAMEMODES.SEARCH)}
            >
              S&D
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default GameModeSelector;
