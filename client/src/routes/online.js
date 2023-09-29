import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import GameModeSelector from "../components/GameModeSelector";
import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";
import { GAMEMODE_TYPES } from "../enums/gameEnums";
import { useState, useRef } from "react";

import OpponentSearchButton from "../components/OpponentSearchButton";
// import { useLocation } from "react-router-dom";

function Online({ navigate, userId, authHelper }) {
  const [currentPage, setCurrentPage] = useState(PAGES.ONLINE.INITIAL);
  const [currentGameMode, setCurrentGameMode] = useState({
    gameModeType: "",
    gameMode: "",
  });

  const onlineInitial = () => {
    return (
      <>
        <GameModeSelector
          gameModeSetter={setCurrentGameMode}
          gameModeType={GAMEMODE_TYPES.QUICKPLAY}
          bonusStyles="bottomBorder"
          pageSetter={setCurrentPage}
        />
        <GameModeSelector
          gameModeSetter={setCurrentGameMode}
          gameModeType={GAMEMODE_TYPES.RANKED}
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
          onClick={() => setCurrentPage(PAGES.ONLINE.SEARCH_OPPONENT)}
        >
          Search Opponent
        </button>
        <button
          style={{ flex: 3 }}
          className="defaultColor"
          onClick={() => setCurrentPage(PAGES.ONLINE.RANDOM_OPPONENT)}
        >
          Random Opponent
        </button>
      </>
    );
  };

  const randomOpponent = () => {
    //console.log("isrunning twicea?");
    authHelper(API_ROUTES.MATCHMAKING.RANDOM.NEW_PLAYER, "POST", {
      client_id: userId,
    })
      .then((res) => {
        return res.json();
      })
      .then((roster) => {
        console.log(roster);
      });

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
          onClick={() => {
            //console.log("isrunning twiceb?");
            authHelper(API_ROUTES.MATCHMAKING.RANDOM.REMOVE_PLAYER, "POST", {
              client_id: userId,
            });
            setCurrentPage(PAGES.ONLINE.GAMEMODE_CHOSEN);
          }}
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
        <OpponentSearchButton authHelper={authHelper} userId={userId} />
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
            if (previousPage === PAGES.MAIN_MENU) navigate(`/${previousPage}`);
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
    case PAGES.ONLINE.INITIAL:
      return getPage(PAGES.MAIN_MENU, onlineInitial);
    case PAGES.ONLINE.GAMEMODE_CHOSEN:
      return getPage(PAGES.ONLINE.INITIAL, gameModeChosen);
    case PAGES.ONLINE.RANDOM_OPPONENT:
      return getPage(null, randomOpponent, false);
    case PAGES.ONLINE.SEARCH_OPPONENT:
      return getPage(PAGES.ONLINE.GAMEMODE_CHOSEN, onlineSearchOpponent);
  }
}

export default Online;
