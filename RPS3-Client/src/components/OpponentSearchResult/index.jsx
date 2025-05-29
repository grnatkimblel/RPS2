import { useState } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

import DisplayStates from "../../enums/DisplayStates";
import API_ROUTES from "../../enums/API_Routes";
import { MATCHMAKING_TYPES } from "../../shared/enums/gameEnums";

export default function OpponentSearchResult({
  setDisplayState,
  opponentInfo,
  authorizeThenCallHttp,
  matchmakingPreferences,
  setCurrentGameInfo,
}) {
  const [hasSentInvitation, setHasSentInvitation] = useState(false);
  const [currentColor, setCurrentColor] = useState("#626262");

  const sendInvitation = () => {
    // setIsGreen(true);
    // console.log(currentGameMode);
    let recentPlayers = localStorage.getItem("recentPlayers");
    console.log(typeof recentPlayers);
    console.log(recentPlayers);
    recentPlayers = JSON.parse(recentPlayers);
    console.log(typeof recentPlayers);
    console.log(recentPlayers);

    if (recentPlayers && recentPlayers.indexOf(opponentInfo.id) == -1) {
      localStorage.setItem("recentPlayers", JSON.stringify([...recentPlayers, opponentInfo.id]));
    } else {
      localStorage.setItem("recentPlayers", JSON.stringify([opponentInfo.id]));
    }

    authorizeThenCallHttp(API_ROUTES.MATCHMAKING.ADD_PLAYER, "POST", {
      gameType: matchmakingPreferences.gameType,
      gameMode: matchmakingPreferences.gameMode,
      matchmakingType: MATCHMAKING_TYPES.SEARCH,

      chosenOne_id: opponentInfo.id,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        //skip the rest of the then chain if the response indicates that the player has been removed from matchmaking
        if (data.wasCancelled) return Promise.reject("wasCancelled");
        return data.roster;
      })
      .then((roster) => {
        // console.log("roster to be sent to pregame ", roster);
        //call the right pregame based on the gamemode

        return authorizeThenCallHttp(API_ROUTES.GAME.QUICKDRAW.PREGAME, "POST", {
          roster,
        });
      })
      .then((res) => res.json())
      .then((data) => {
        /*
      data :
        sessionId: roster.rosterId,
        gameStartTime: activeRooms.get(roster.rosterId).gameStartTime,
        player1: player_1_info, from db
        player2: player_2_info, from db
      */
        setCurrentGameInfo(data);
        setDisplayState(DisplayStates.Quickdraw_Arena_Online);
        // navigate(`/${PAGES.ONLINE.QUICKDRAW_ARENA}`);
      });
  };

  const unSendInvitation = (e) => {
    //console.log("**unsendInvitation**");
    // setIsGreen(false);
    if (hasSentInvitation) {
      authorizeThenCallHttp(API_ROUTES.MATCHMAKING.REMOVE_PLAYER, "POST", {
        gameType: matchmakingPreferences.gameType,
        gameMode: matchmakingPreferences.gameMode,
        matchmakingType: MATCHMAKING_TYPES.SEARCH,
      });
      setHasSentInvitation(false);
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <p style={{ margin: "0rem" }} className="labelText">
        {opponentInfo.username}
      </p>
      <motion.button
        className="none"
        onClick={() => {
          if (!hasSentInvitation) {
            sendInvitation();
            setHasSentInvitation(true);
          } else {
            unSendInvitation();
            setHasSentInvitation(false);
          }
        }}
        whileTap={{ y: 5 }}
        whileHover={{ scale: 1.05 }}
      >
        <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.4999 28.4163C22.6336 28.4163 28.4166 22.6334 28.4166 15.4997C28.4166 8.366 22.6336 2.58301 15.4999 2.58301C8.36624 2.58301 2.58325 8.366 2.58325 15.4997C2.58325 22.6334 8.36624 28.4163 15.4999 28.4163Z"
            stroke={opponentInfo.isJoinable ? "#0ED145" : hasSentInvitation ? "#007AFF" : currentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.9166 10.333L20.6666 15.4997L12.9166 20.6663V10.333Z"
            stroke={opponentInfo.isJoinable ? "#0ED145" : hasSentInvitation ? "#007AFF" : currentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </div>
  );
}
