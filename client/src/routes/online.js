import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import GameModeSelector from "../components/GameModeSelector";
import pages from "../enums/pages";
import { gameModeTypes } from "../enums/gameEnums";
import { useState, useRef } from "react";

import OpponentSearchButton from "../components/OpponentSearchButton";
// import { useLocation } from "react-router-dom";

function Online({ navigate }) {
  const [currentPage, setCurrentPage] = useState(pages.ONLINE.INITIAL);
  const [currentGameMode, setCurrentGameMode] = useState({
    gameModeType: "",
    gameMode: "",
  });

  const onlineInitial = () => {
    return (
      <>
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
      </>
    );
  };
  const gameModeChosen = () => {
    return (
      <>
        <div className="gamemode-smalltext">{currentGameMode.gameModeType}</div>
        <button
          style={{ flex: 1 }}
          className="notInteractableColor bottomBorder"
        >
          {currentGameMode.gameMode}
        </button>
        <button
          style={{ flex: 3 }}
          className="defaultColor bottomBorder"
          onClick={() => setCurrentPage(pages.ONLINE.SEARCH_OPPONENT)}
        >
          Search Opponent
        </button>
        <button
          style={{ flex: 3 }}
          className="defaultColor"
          onClick={() => setCurrentPage(pages.ONLINE.RANDOM_OPPONENT)}
        >
          Random Opponent
        </button>
      </>
    );
  };
  const randomOpponent = () => {
    return (
      <>
        <div className="gamemode-smalltext">{currentGameMode.gameModeType}</div>
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
      </>
    );
  };

  const onlineSearchOpponent = () => {
    return (
      <>
        <div className="gamemode-smalltext">{currentGameMode.gameModeType}</div>
        <button
          style={{ flex: 3 }}
          className="notInteractableColor bottomBorder"
        >
          {currentGameMode.gameMode}
        </button>
        <button
          style={{ flex: 2 }}
          className="secondary notInteractableColor bottomBorder"
        >
          Search Opponent
        </button>
        <OpponentSearchButton />
      </>
    );
  };

  const getPage = (
    previousPage,
    currentPage,
    isBackButtonInteractable = true
  ) => {
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <button
          style={{ flex: 1 }}
          className={
            isBackButtonInteractable ? "defaultColor" : "notInteractableColor"
          }
          onClick={() => {
            if (previousPage === pages.MAIN_MENU) navigate(`/${previousPage}`);
            else setCurrentPage(previousPage);
          }}
        >
          Back
        </button>
        {/* LeftSide */}
        <div
          style={{ display: "flex", flex: 1, flexDirection: "column" }}
          className="leftBorder"
        >
          {currentPage()}
        </div>
      </div>
    );
  };

  switch (currentPage) {
    case pages.ONLINE.INITIAL:
      return getPage(pages.MAIN_MENU, onlineInitial);
    case pages.ONLINE.GAMEMODE_CHOSEN:
      return getPage(pages.ONLINE.INITIAL, gameModeChosen);
    case pages.ONLINE.RANDOM_OPPONENT:
      return getPage(null, randomOpponent, false);
    case pages.ONLINE.SEARCH_OPPONENT:
      return getPage(pages.ONLINE.GAMEMODE_CHOSEN, onlineSearchOpponent);
  }
}

export default Online;
