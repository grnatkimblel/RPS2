import pages from "../enums/pages";
import { gameModes, gameModeTypes } from "../enums/gameEnums";

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
      case gameModeTypes.QUICKPLAY:
        //console.log("quickplay selected");
        gameModeSetter({
          gameModeType: gameModeType,
          gameMode: childGameMode,
        });
        break;

      case gameModeTypes.RANKED:
        //console.log("ranked selected");
        gameModeSetter({
          gameModeType: gameModeType,
          gameMode: childGameMode,
        });
        break;
      default:
        console.log("GameModeSelector invalid case in switch");
    }
    pageSetter(pages.ONLINE.GAMEMODE_CHOSEN);
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
          className="defaultColor bottomBorder"
          onClick={() => setGameMode(gameModes.QUICKDRAW)}
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
              className={"defaultColor " + bonusStyles}
              onClick={() => setGameMode(gameModes.TDM)}
            >
              TDM
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <div className="gamemode-smalltext">{gameModeType}</div>
            <button
              style={{ width: "100%", height: "100%" }}
              className={
                "defaultColor redTextBorder smooth-16 leftBorder " + bonusStyles
              }
              onClick={() => setGameMode(gameModes.SEARCH)}
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
