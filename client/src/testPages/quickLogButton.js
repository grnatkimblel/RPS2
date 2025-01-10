import API_ROUTES from "../enums/apiRoutes";
import PAGES from "../enums/pages";
import { MATCHMAKING_TYPES, GAMEMODES, GAMEMODE_TYPES } from "../shared/enums/gameEnums"; //This file name is set in docker compose

import { useState, useEffect } from "react";

function QuickLogButton({ navigate, login, authHelper, userInfo, gameInfoSetter, credential }) {
  const [pageFlavor, setPageFlavor] = useState("");

  useEffect(() => {
    console.log("userInfo", userInfo);
  }, [userInfo]);

  const autoLogin = async (credentials) => {
    //check if this player exists
    //if not create the account

    let res = await fetch(API_ROUTES.REGISTER, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(credentials),
    });

    //login
    await login(credentials, PAGES.INITIAL);
  };

  const matchmaker = (gameType, gameMode) => {
    authHelper(API_ROUTES.MATCHMAKING.ADD_PLAYER, "POST", {
      gameType: gameType,
      gameMode: gameMode,
      matchmakingType: MATCHMAKING_TYPES.RANDOM,
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        return data.roster;
      })
      .then((roster) => {
        if (roster == null) return;
        console.log("roster to be sent to pregame ", roster);
        const apiRoute =
          gameMode === GAMEMODES.QUICKDRAW
            ? API_ROUTES.GAME.QUICKDRAW.PREGAME
            : gameMode === GAMEMODES.TDM
            ? API_ROUTES.GAME.TDM.PREGAME
            : null;
        //call the right pregame based on the gamemode
        return authHelper(apiRoute, "POST", {
          roster,
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            gameInfoSetter(data);
            if (gameType == GAMEMODE_TYPES.QUICKPLAY && gameMode == GAMEMODES.QUICKDRAW)
              navigate(`/${PAGES.ONLINE.QUICKDRAW_ARENA}`);
            else if (gameType == GAMEMODE_TYPES.QUICKPLAY && gameMode == GAMEMODES.TDM)
              navigate(`/${PAGES.ONLINE.TDM_ARENA}`);
          });
      });
  };

  function getLoginButtonColor(targetUsername, buttonUsername) {
    if (targetUsername == "") {
      return "defaultColor bottomBorder";
    }
    if (targetUsername == buttonUsername) {
      return "submittable bottomBorder";
    } else {
      return "notInteractableColor bottomBorder";
    }
  }

  function getQueueButtonColor(username, targetUsername) {
    if (username != "" && username == targetUsername) {
      return "defaultColor bottomBorder";
    } else {
      return "notInteractableColor bottomBorder";
    }
  }

  function getButton(pageFlavor) {
    if (pageFlavor == "") {
      return (
        <button
          style={{ flex: 1 }}
          className={getLoginButtonColor(userInfo.username, credential.username)}
          onClick={() => {
            autoLogin(credential);
            setPageFlavor("Selected");
          }}
        >
          {"Login as " + credential.username}
        </button>
      );
    } else {
      return (
        <>
          <button
            style={{ flex: 1 }}
            className={getQueueButtonColor(userInfo.username, credential.username)}
            onClick={() => {
              matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.QUICKDRAW);
            }}
          >
            Random Queue Quickdraw
          </button>
          <button
            style={{ flex: 1 }}
            className={getQueueButtonColor(userInfo.username, credential.username)}
            onClick={() => {
              matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.TDM);
            }}
          >
            Random Queue TDM
          </button>
          <button
            style={{ flex: 1 }}
            className={getQueueButtonColor(userInfo.username, credential.username)}
            onClick={() => {
              matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.SEARCH);
            }}
          >
            Random Queue Search
          </button>
        </>
      );
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
      }}
    >
      {getButton(pageFlavor)}
    </div>
  );
}

export default QuickLogButton;
