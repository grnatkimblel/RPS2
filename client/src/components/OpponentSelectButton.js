import { useState } from "react";
import API_ROUTES from "../enums/apiRoutes";

function OpponentSelectButton({
  opponentInfo,
  styles,
  classes,
  authHelper,
  userId,
}) {
  const [isGreen, setIsGreen] = useState(opponentInfo.isJoinable);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);

  const sendInvitation = () => {
    setIsGreen(true);
    authHelper(API_ROUTES.MATCHMAKING.SEARCH.NEW_INVITE, "POST", {
      client_id: userId,
      chosenOne_id: opponentInfo.id,
    });
    setInvitationSent(true);
  };

  const unSendInvitation = (e) => {
    //console.log("**unsendInvitation**");
    setIsGreen(false);
    if (invitationSent) {
      authHelper(API_ROUTES.MATCHMAKING.SEARCH.REMOVE_INVITE, "POST", {
        client_id: userId,
      });
      setInvitationSent(false);
    }
  };

  // console.log("OpponentSelectButton: ");
  // console.log(
  //   "     opponentName: ",
  //   opponentInfo.username,
  //   " isJoinable: ",
  //   opponentInfo.isJoinable
  // );
  // console.log("     isGreen: ", isGreen);

  return (
    <button
      style={styles}
      className={
        classes +
        (isGreen || opponentInfo.isJoinable ? " submittable" : "  defaultColor")
      }
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
