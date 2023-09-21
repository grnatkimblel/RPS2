import { useState, useRef } from "react";

import OpponentSelectButton from "../components/OpponentSelectButton";

function OpponentSearchButton() {
  const inputFieldRef = useRef(null);
  let i = 0;
  const dummyOpponents = [];
  for (i = 1; i <= 70; i++) {
    dummyOpponents.push({ id: i, name: "Opponent: " + i, isJoinable: false });
  }
  const [opponents, setOpponents] = useState(dummyOpponents);
  const [listStartIndex, setListStartIndex] = useState(0); //idk yet
  const diff = 7;
  const listEndIndex = listStartIndex + diff;

  const opponentPageSelectorButton = (numOpponents) => {
    // console.log(listStartIndex);
    // console.log(listEndIndex);
    if (numOpponents > 8) {
      if (listStartIndex < diff) {
        console.log("test");
        return (
          <MoreButton
            styles={{ pointerEvents: "auto" }}
            text="More..."
            OnClick={(e) => {
              e.stopPropagation();

              setListStartIndex(listStartIndex + 8);
            }}
          />
        );
      } else if (listEndIndex < opponents.length) {
        return (
          <div style={{ display: "flex" }}>
            <MoreButton
              styles={{ flex: 1, pointerEvents: "auto" }}
              text="Back"
              OnClick={(e) => {
                e.stopPropagation();

                setListStartIndex(listStartIndex - 8);
              }}
            />
            <MoreButton
              styles={{ flex: 1, pointerEvents: "auto" }}
              text="More..."
              OnClick={(e) => {
                e.stopPropagation();

                setListStartIndex(listStartIndex + 8);
              }}
              noLeftBorder={true}
            />
          </div>
        );
      } else {
        return (
          <MoreButton
            styles={{ pointerEvents: "auto" }}
            text="Back"
            OnClick={(e) => {
              e.stopPropagation();

              setListStartIndex(listStartIndex - 8);
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
      {/* these need to stay in this div, positioning will have to be more explicit, cant really use flex w/out
       */}
      <input className="search" ref={inputFieldRef}></input>

      <div
        style={{
          flex: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: "60px",
          marginRight: "60px",
          pointerEvents: "none",
        }}
      >
        {opponents.map((opponent, index) => {
          if (listStartIndex <= index && index <= listEndIndex) {
            let classes = "";
            if (index == listStartIndex)
              //this is why idk yet/\
              classes =
                "secondary bottomBorder topBorder leftBorder rightBorder";
            else classes = "secondary bottomBorder leftBorder rightBorder";
            return (
              <OpponentSelectButton
                styles={{ pointerEvents: "auto" }}
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

function MoreButton({ text, OnClick, styles, noLeftBorder = false }) {
  return (
    <button
      style={styles}
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
