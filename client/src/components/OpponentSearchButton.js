import { useState, useRef } from "react";

import OpponentSelectButton from "../components/OpponentSelectButton";

function OpponentSearchButton() {
  const inputFieldRef = useRef(null);
  let i = 0;
  const dummyOpponents = [];
  for (i = 1; i <= 20; i++) {
    dummyOpponents.push({ id: i, name: "Opponent: " + i, isJoinable: false });
  }
  const [opponents, setOpponents] = useState(dummyOpponents);
  const [opponentDisplayRange, setOpponentDisplayRange] = useState([1, 8]); //idk yet
  const diff = opponentDisplayRange[1] - opponentDisplayRange[0];

  const opponentPageSelectorButton = (numOpponents) => {
    console.log(opponentDisplayRange);
    console.log(diff);
    if (numOpponents > 8) {
      if (opponentDisplayRange[0] < diff) {
        console.log("test");
        return (
          <MoreButton
            text="More..."
            OnClick={(e) => {
              e.stopPropagation();

              setOpponentDisplayRange([
                opponentDisplayRange[0] + diff,
                opponentDisplayRange[1] + diff,
              ]);
            }}
          />
        );
      } else if (opponentDisplayRange[1] < opponents.length) {
        return (
          <div style={{ display: "flex" }}>
            <MoreButton
              text="Back"
              OnClick={(e) => {
                e.stopPropagation();

                setOpponentDisplayRange([
                  opponentDisplayRange[0] - diff,
                  opponentDisplayRange[1] - diff,
                ]);
              }}
            />
            <MoreButton
              text="More..."
              OnClick={(e) => {
                e.stopPropagation();

                setOpponentDisplayRange([
                  opponentDisplayRange[0] + diff,
                  opponentDisplayRange[1] + diff,
                ]);
              }}
              noLeftBorder={true}
            />
          </div>
        );
      } else {
        return (
          <MoreButton
            text="Back"
            OnClick={(e) => {
              e.stopPropagation();

              setOpponentDisplayRange([
                opponentDisplayRange[0] - diff,
                opponentDisplayRange[1] - diff,
              ]);
            }}
          />
        );
      }
    }
  };

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
          if (
            opponentDisplayRange[0] - 1 <= index &&
            index <= opponentDisplayRange[1] - 1
          ) {
            let classes = "";
            if (index == opponentDisplayRange[0] - 1)
              //this is why idk yet/\
              classes =
                "secondary bottomBorder topBorder leftBorder rightBorder";
            else classes = "secondary bottomBorder leftBorder rightBorder";
            return (
              <OpponentSelectButton
                key={opponent.id}
                opponentInfo={opponent}
                classes={classes}
              />
            );
          }
        })}
        {opponentPageSelectorButton(opponents.length)}
      </div>
    </div>
  );
}

function MoreButton({ text, OnClick, noLeftBorder = false }) {
  return (
    <button
      style={{ flex: 1 }}
      className={
        "secondary defaultColor bottomBorder rightBorder " +
        (noLeftBorder ? "" : "leftBorder ")
      }
      onClick={OnClick}
      onMouseOver={(e) => {
        e.stopPropagation();
      }}
    >
      {text}
    </button>
  );
}

export default OpponentSearchButton;
