import { useState, useRef } from "react";

import OpponentSelectButton from "../components/OpponentSelectButton";

function OpponentSearchButton() {
  const inputFieldRef = useRef(null);
  const dummyOpponents = Array(9).fill("Opponent");
  const [opponents, setOpponents] = useState(dummyOpponents);
  const [opponentDisplayRange, setOpponentDisplayRange] = useState([1, 8]); //idk yet

  return (
    <div
      style={{
        cursor: "text",
        flex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
      }}
      className="defaultColor"
      onClick={() => inputFieldRef.current.focus()}
    >
      {/* im not sure if form is needed */}

      <input className="search" ref={inputFieldRef}></input>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          margin: "60px",
        }}
      >
        {opponents.map((opponent, index) => {
          let classes = "";
          if (index == 0)
            //this is why idk yet/\
            classes = "secondary bottomBorder topBorder leftBorder rightBorder";
          else classes = "secondary bottomBorder leftBorder rightBorder";
          return (
            <OpponentSelectButton opponentName={"Opponent"} classes={classes} />
          );
        })}
        {moreButton(opponents.length)}
      </div>
    </div>
  );
}

function moreButton(numOpponents) {
  if (numOpponents > 8) {
    return (
      <button
        className="secondary defaultColor bottomBorder leftBorder rightBorder"
        onClick={(e) => {
          e.stopPropagation();
          //setCurrentPage(pages.ONLINE.GAMEMODE_CHOSEN);
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
        }}
      >
        More...
      </button>
    );
  }
  return;
}

export default OpponentSearchButton;
