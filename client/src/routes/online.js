import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import GameModeSelector from "../components/GameModeSelector";
import pages from "../enums/pages";
import { gameModeTypes } from "../enums/gameEnums";
import { useState } from "react";
// import { useLocation } from "react-router-dom";

function Online({ navigate }) {
  const [currentPage, setCurrentPage] = useState(pages.ONLINE.INITIAL);
  const [currentGameMode, setCurrentGameMode] = useState({
    gameModeType: "",
    gameMode: "",
  });

  //   const location = useLocation();
  //   const locationState = location.state;
  switch (currentPage) {
    case pages.ONLINE.INITIAL:
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button
            style={{ flex: 1 }}
            className="defaultColor"
            onClick={() => navigate(`/${pages.MAIN_MENU}`)}
          >
            Back
          </button>
          <div
            style={{ display: "flex", flex: 1, flexDirection: "column" }}
            className="leftBorder"
          >
            <GameModeSelector
              gameModeSetter={setCurrentGameMode}
              gameModeType={gameModeTypes.QUICKPLAY}
              bonusStyles="bottomBorder"
              pageSetter={setCurrentPage}
            />
            <GameModeSelector
              gameModeSetter={setCurrentGameMode}
              gameModeType={gameModeTypes.RANKED}
              pageSetter={setCurrentPage}
            />
          </div>
        </div>
      );
    case pages.ONLINE.GAMEMODE_CHOSEN:
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button
            style={{ flex: 1 }}
            className="defaultColor"
            onClick={() => setCurrentPage(pages.ONLINE.INITIAL)}
          >
            Back
          </button>
          <div
            style={{
              flexDirection: "column",
              flex: 1,
              display: "flex",
              height: "100%",
            }}
            className="leftBorder"
          >
            <div className="gamemode-smalltext">
              {currentGameMode.gameModeType}
            </div>
            <button
              style={{ flex: 1 }}
              className="notInteractableColor bottomBorder"
            >
              {currentGameMode.gameMode}
            </button>
            <button style={{ flex: 3 }} className="defaultColor bottomBorder">
              Search Opponent
            </button>
            <button
              style={{ flex: 3 }}
              className="defaultColor"
              onClick={() => setCurrentPage(pages.ONLINE.OPPONENT_TYPE_CHOSEN)}
            >
              Random Opponent
            </button>
          </div>
        </div>
      );
    case pages.ONLINE.OPPONENT_TYPE_CHOSEN:
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button style={{ flex: 1 }} className="notInteractableColor">
            Back
          </button>
          <div
            style={{
              flexDirection: "column",
              flex: 1,
              display: "flex",
              height: "100%",
            }}
            className="leftBorder"
          >
            <div className="gamemode-smalltext">
              {currentGameMode.gameModeType}
            </div>
            <button
              style={{ flex: 1 }}
              className="notInteractableColor bottomBorder"
            >
              {currentGameMode.gameMode}
            </button>
            <button
              style={{ flex: 3 }}
              className="notInteractableColor bottomBorder"
            >
              Searching...
            </button>
            <button
              style={{ flex: 3 }}
              className="defaultColor"
              onClick={() => setCurrentPage(pages.ONLINE.GAMEMODE_CHOSEN)}
            >
              Cancel
            </button>
          </div>
        </div>
      );
  }
}

export default Online;
