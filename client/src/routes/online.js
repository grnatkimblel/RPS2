import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import GameModeSelector from "../components/GameModeSelector";
import pages from "../enums/pages";
import { gameModeTypes } from "../enums/gameEnums";
import { useState, useRef } from "react";
import OpponentSelectButton from "../components/OpponentSelectButton";
// import { useLocation } from "react-router-dom";

function Online({ navigate }) {
  const [currentPage, setCurrentPage] = useState(pages.ONLINE.INITIAL);
  const [currentGameMode, setCurrentGameMode] = useState({
    gameModeType: "",
    gameMode: "",
  });
  const inputFieldRef = useRef(null);
  const opponents = [
    "Opponent",
    "Opponent",
    "Opponent",
    "Opponent",
    "Opponent",
    "Opponent",
    "Opponent",
    "Opponent",
  ];

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
        <div
          style={{
            cursor: "text",
            flex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
          className="defaultColor"
          onClick={() => inputFieldRef.current.focus()}
        >
          {/* im not sure if form is needed */}

          <input className="search" ref={inputFieldRef}></input>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              margin: "60px",
            }}
          >
            {opponents.map((opponent, index) => {
              let classes = "";
              if (index == 0)
                classes =
                  "secondary bottomBorder topBorder leftBorder rightBorder";
              else classes = "secondary bottomBorder leftBorder rightBorder";
              return (
                <OpponentSelectButton
                  opponentName={"Opponent"}
                  classes={classes}
                />
              );
            })}
            <button
              className="secondary defaultColor bottomBorder leftBorder rightBorder"
              onClick={(e) => {
                e.stopPropagation();
                //setCurrentPage(pages.ONLINE.GAMEMODE_CHOSEN);
              }}
              onMouseOver={(e) => {
                e.stopPropagation();
              }}
            >
              More...
            </button>
          </div>
        </div>
      </>
    );
  };

  const getPage = (previousPage, currentPage, classes) => {
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <button
          style={{ flex: 1 }}
          className={classes ? classes : "defaultColor"}
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
      return getPage(
        pages.ONLINE.INITIAL, //does nothing for this page
        randomOpponent,
        "notInteractableColor"
      );
    case pages.ONLINE.SEARCH_OPPONENT:
      return getPage(pages.ONLINE.GAMEMODE_CHOSEN, onlineSearchOpponent);
  }

  //   const location = useLocation();
  //   const locationState = location.state;
}

export default Online;
