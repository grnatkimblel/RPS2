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
            styles={{ marginBottom: "40px" }}
            text="More..."
            OnClick={(e) => {
              e.stopPropagation();

              setListStartIndex(listStartIndex + 8);
            }}
          />
        );
      } else if (listEndIndex < opponents.length) {
        return (
          <div style={{ display: "flex", marginBottom: "40px" }}>
            <MoreButton
              styles={{ flex: 1 }}
              text="Back"
              OnClick={(e) => {
                e.stopPropagation();

                setListStartIndex(listStartIndex - 8);
              }}
            />
            <MoreButton
              styles={{ flex: 1 }}
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
            styles={{ marginBottom: "40px" }}
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
      {/* im not sure if form is needed */}
      <div style={{ flex: 1, justifyContent: "center", display: "flex" }}>
        <input className="search" ref={inputFieldRef}></input>
      </div>
      <div
        style={{
          flex: 7,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: "60px",
          marginRight: "60px",
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
