import { useState } from "react";

function OpponentSelectButton({ opponentInfo, styles, classes }) {
  const [isGreen, setIsGreen] = useState(opponentInfo.isJoinable);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const sendInvitation = () => {
    setIsGreen(true);
  };

  const unSendInvitation = (e) => {
    setIsGreen(false);
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
        if (opponentInfo.isJoinable) {
          //the client has clicked a player who is joinable
          //make a match between these two players
          //bring the client to the arena
        }
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
      {opponentInfo.name}
    </button>
  );
}

export default OpponentSelectButton;
