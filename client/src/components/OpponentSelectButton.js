import { useState } from "react";
import API_ROUTES from "../enums/apiRoutes";
import PAGES from "../enums/pages";
import { MATCHMAKING_TYPES } from "../shared/enums/gameEnums";

function OpponentSelectButton({
  navigate,
  opponentInfo,
  styles,
  classes,
  authHelper,
  currentGameMode,
  gameInfoSetter,
}) {
  const [isGreen, setIsGreen] = useState(opponentInfo.isJoinable);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);

  const sendInvitation = () => {
    setIsGreen(true);
    // console.log(currentGameMode);
    authHelper(API_ROUTES.MATCHMAKING.ADD_PLAYER, "POST", {
      gameType: currentGameMode.gameType,
      gameMode: currentGameMode.gameMode,
      matchmakingType: MATCHMAKING_TYPES.SEARCH,

      chosenOne_id: opponentInfo.id,
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
        if (roster === null) return;
        console.log("roster to be sent to pregame ", roster);
        //call the right pregame based on the gamemode
        return authHelper(API_ROUTES.GAME.QUICKDRAW.PREGAME, "POST", {
          roster,
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        /*
      data :
        sessionId: roster.rosterId,
        roundStartTime: activeRooms.get(roster.rosterId).roundStartTime,
        player1: player_1_info, from db
        player2: player_2_info, from db
      */
        gameInfoSetter(data);
        navigate(`/${PAGES.ONLINE.QUICKDRAW_ARENA}`);
      });
    setInvitationSent(true);
  };

  const unSendInvitation = (e) => {
    //console.log("**unsendInvitation**");
    setIsGreen(false);
    if (invitationSent) {
      authHelper(API_ROUTES.MATCHMAKING.REMOVE_PLAYER, "POST", {
        gameType: currentGameMode.gameType,
        gameMode: currentGameMode.gameMode,
        matchmakingType: MATCHMAKING_TYPES.SEARCH,
      });
      setInvitationSent(false);
    }
  };

  return (
    <button
      style={styles}
      className={classes + (isGreen || opponentInfo.isJoinable ? " submittable" : "  defaultColor")}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        setIsButtonPressed(true);

        // if (opponentInfo.isJoinable) {
        //   //the client has clicked a player who is joinable
        //   //make a match between these two players
        //   //bring the client to the arena
        // }
        //console.log("mouseDownEvent");
        sendInvitation();
        e.stopPropagation();
      }}
      onMouseUp={() => {
        if (isButtonPressed) {
          unSendInvitation();
          setIsButtonPressed(false);
        }
      }}
      onMouseLeave={() => {
        if (!opponentInfo.isJoinable) unSendInvitation();
        setIsButtonPressed(false);
      }}
    >
      {opponentInfo.username}
    </button>
  );
}

export default OpponentSelectButton;
