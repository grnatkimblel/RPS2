import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";
import API_ROUTES from "../enums/apiRoutes";
import PAGES from "../enums/pages";
import { useState, useEffect } from "react";
import {
  MATCHMAKING_TYPES,
  GAMEMODES,
  GAMEMODE_TYPES,
} from "../shared/enums/gameEnums";

function QuicklogToQueue({
  navigate,
  login,
  authHelper,
  userInfo,
  gameInfoSetter,
}) {
  const GRANT_CREDENTIALS = {
    username: "grant",
    password: "123123",
  };
  const RHETT_CREDENTIALS = {
    username: "rhett",
    password: "123123",
  };

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
        authHelper(API_ROUTES.GAME.QUICKDRAW.PREGAME, "POST", {
          roster,
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            gameInfoSetter(data);
            if (
              gameType == GAMEMODE_TYPES.QUICKPLAY &&
              gameMode == GAMEMODES.QUICKDRAW
            )
              navigate(`/${PAGES.ONLINE.QUICKDRAW_ARENA}`);
            else if (
              gameType == GAMEMODE_TYPES.QUICKPLAY &&
              gameMode == GAMEMODES.TDM
            )
              navigate(`/${PAGES.ONLINE.TDM_ARENA}`);
          });
      });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <div
        style={{ display: "flex", flex: 1, flexDirection: "column" }}
        className=" bottomBorder"
        //   onClick={() => navigate(`/${PAGES.LOGIN}`)}
      >
        <button
          style={{ flex: 3 }}
          className={getLoginButtonColor(userInfo.username, "grant")}
          onClick={() => autoLogin(GRANT_CREDENTIALS)}
        >
          Login as Grant
        </button>
        <button
          style={{ flex: 1 }}
          className={getQueueButtonColor(userInfo.username, "grant")}
          onClick={() =>
            matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.QUICKDRAW)
          }
        >
          Random Queue Quickdraw
        </button>
        <button
          style={{ flex: 1 }}
          className={getQueueButtonColor(userInfo.username, "grant")}
          onClick={() => matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.TDM)}
        >
          Random Queue TDM
        </button>
        <button style={{ flex: 1 }} className="notInteractableColor ">
          Random Queue S&D
        </button>
      </div>
      <div
        style={{ display: "flex", flex: 1, flexDirection: "column" }}
        className=" bottomBorder leftBorder"
        //   onClick={() => navigate(`/${PAGES.LOGIN}`)}
      >
        <button
          style={{ flex: 3 }}
          className={getLoginButtonColor(userInfo.username, "rhett")}
          onClick={() => autoLogin(RHETT_CREDENTIALS)}
        >
          Login as Rhett
        </button>
        <button
          style={{ flex: 1 }}
          className={getQueueButtonColor(userInfo.username, "rhett")}
          onClick={() =>
            matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.QUICKDRAW)
          }
        >
          Random Queue Quickdraw
        </button>
        <button
          style={{ flex: 1 }}
          className={getQueueButtonColor(userInfo.username, "rhett")}
          onClick={() => matchmaker(GAMEMODE_TYPES.QUICKPLAY, GAMEMODES.TDM)}
        >
          Random Queue TDM
        </button>
        <button style={{ flex: 1 }} className="notInteractableColor ">
          Random Queue S&D
        </button>
      </div>
      <div className="title">RPS</div>
    </div>
  );
}

export default QuicklogToQueue;
