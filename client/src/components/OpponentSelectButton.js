import { useState } from "react";
import API_ROUTES from "../enums/apiRoutes";
import { MATCHMAKING_TYPES } from "../shared/enums/gameEnums";

function OpponentSelectButton({ opponentInfo, styles, classes, authHelper, currentGameMode, gameInfoSetter }) {
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
    }).then(async (res) => {
      const data = await res.json();
      console.log("OpponentSelectButton received response from Search:NewInvite Endpoint");
      console.log(data);
      gameInfoSetter(data);
      // navigate(`/${PAGES.ONLINE.QUICKDRAW_ARENA}`);
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
