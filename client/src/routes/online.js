import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import GameModeSelector from "../components/GameModeSelector";
import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";
import {
  GAMEMODES,
  GAMEMODE_TYPES,
  MATCHMAKING_TYPES,
} from "../shared/enums/gameEnums"; //This file name is set in docker compose
import { useState, useEffect, useRef } from "react";

import OpponentSearchButton from "../components/OpponentSearchButton";
// import { useLocation } from "react-router-dom";

function Online({ navigate, authHelper, gameInfoSetter }) {
  const [currentPage, setCurrentPage] = useState(PAGES.ONLINE.INITIAL);
  const [currentGameMode, setCurrentGameMode] = useState({
    gameType: "",
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
        <div className="gamemode-smalltext">{currentGameMode.gameType}</div>
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
          onClick={() => {
            setCurrentPage(PAGES.ONLINE.RANDOM_OPPONENT);
            authHelper(API_ROUTES.MATCHMAKING.ADD_PLAYER, "POST", {
              gameType: currentGameMode.gameType,
              gameMode: currentGameMode.gameMode,
              matchmakingType: MATCHMAKING_TYPES.RANDOM,
            })
              .then((res) => {
                return res.json();
              })
              .then((data) => {
                console.log(data);
                if (data.wasCancelled) {
                  return null;
                } else {
                  return data.roster;
                }
              })
              .then((roster) => {
                if (roster == null) return;
                console.log("roster to be sent to pregame ", roster);
                const apiRoute =
                  currentGameMode.gameMode === GAMEMODES.QUICKDRAW
                    ? API_ROUTES.GAME.QUICKDRAW.PREGAME
                    : currentGameMode.gameMode === GAMEMODES.TDM
                    ? API_ROUTES.GAME.TDM.PREGAME
                    : null;
                //call the right pregame based on the gamemode
                return authHelper(apiRoute, "POST", {
                  roster,
                });
              })
              .then((res) => {
                return res.json();
              })
              .then((data) => {
                gameInfoSetter(data);
                if (
                  currentGameMode.gameType == GAMEMODE_TYPES.QUICKPLAY &&
                  currentGameMode.gameMode == GAMEMODES.QUICKDRAW
                )
                  navigate(`/${PAGES.ONLINE.QUICKDRAW_ARENA}`);
                else if (
                  currentGameMode.gameType == GAMEMODE_TYPES.QUICKPLAY &&
                  currentGameMode.gameMode == GAMEMODES.TDM
                )
                  navigate(`/${PAGES.ONLINE.TDM_ARENA}`);
              });
          }}
        >
          Random Opponent
        </button>
      </>
    );
  };

  const randomOpponent = () => {
    return (
      <>
        <div className="gamemode-smalltext">{currentGameMode.gameType}</div>
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
            console.log("isrunning twiceb?");
            authHelper(API_ROUTES.MATCHMAKING.REMOVE_PLAYER, "POST", {
              gameType: currentGameMode.gameType,
              gameMode: currentGameMode.gameMode,
              matchmakingType: MATCHMAKING_TYPES.RANDOM,
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
        <div className="gamemode-smalltext">{currentGameMode.gameType}</div>
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
        <OpponentSearchButton
          authHelper={authHelper}
          gameInfoSetter={gameInfoSetter}
          currentGameMode={currentGameMode}
        />
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
