import { useState } from "react";
import API_ROUTES from "../enums/apiRoutes";

function OpponentSelectButton({
  opponentInfo,
  styles,
  classes,
  authHelper,
  UserId,
}) {
  const [isGreen, setIsGreen] = useState(opponentInfo.isJoinable);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);

  const sendInvitation = () => {
    setIsGreen(true);
    authHelper(API_ROUTES.MATCHMAKING.SEARCH.NEW_INVITE, "POST", {
      client_id: UserId,
      chosenOne_id: opponentInfo.id,
    });
    setInvitationSent(true);
  };

  const unSendInvitation = (e) => {
    setIsGreen(false);
    if (invitationSent) {
      authHelper(API_ROUTES.MATCHMAKING.SEARCH.REMOVE_INVITE, "POST", {
        client_id: UserId,
      });
      setInvitationSent(false);
    }
  };

  return (
    <button
      style={styles}
      className={classes + (isGreen ? " submittable" : "  defaultColor")}
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
