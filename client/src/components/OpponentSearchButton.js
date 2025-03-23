import { useState, useRef, useEffect, useCallback } from "react";
import { useInterval } from "../hooks/useInterval";

import OpponentSelectButton from "../components/OpponentSelectButton";
import API_ROUTES from "../enums/apiRoutes";

function OpponentSearchButton({ navigate, authHelper, gameInfoSetter, currentGameMode }) {
  const inputFieldRef = useRef(null);
  const [opponentsDisplay, setOpponentsDisplay] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [listStartIndex, setListStartIndex] = useState(0); //idk yet
  const diff = 7;
  const listEndIndex = listStartIndex + diff;

  let i = 0;
  let dummyOpponents = [];
  for (i = 1; i <= 17; i++) {
    dummyOpponents.push({
      id: i,
      name: ` Opponent: ` + i,
      isJoinable: false,
    });
  }
  let dummyListOfRecentPlayers = ["881ff655-2ce3-4de4-9d2d-79ac25b45842", "447a2806-e6a5-4d74-afff-e86cde8fe8a0"];
  const [opponents, setOpponents] = useState([]);

  const updateIsJoinableStatus = useCallback(
    async (opponentsList) => {
      if (opponentsList.length === 0) return opponentsList;

      return await Promise.all(
        opponentsList.map(async (opponent) => {
          // console.log("opponent in updateIsJoinableStatus ", opponent);
          const response = await authHelper(API_ROUTES.MATCHMAKING.SEARCH.CHECK_INVITE, "POST", {
            otherPlayer_id: opponent.id,
            gameType: currentGameMode.gameType,
            gameMode: currentGameMode.gameMode,
          });
          const isJoinable = await response.json();
          return { ...opponent, isJoinable: isJoinable };
        })
      );
    },
    [authHelper]
  );

  useInterval(async () => {
    //console.log("opponents ", opponents);
    // //console.log(opponentsWithInviteData );
    const opponentsWithInviteData = await updateIsJoinableStatus(opponents);
    setOpponentsDisplay(opponentsWithInviteData);
    //console.log("set opponentsDisplay to ", opponentsWithInviteData);
  }, 500);

  useEffect(() => {
    let ignore = false;
    authHelper(API_ROUTES.GET_USERS, "POST", {
      searchText: searchText,
      listOfPlayers: dummyListOfRecentPlayers,
    }).then((res) => {
      if (res === undefined) return;
      res.json().then(async (body) => {
        if (!ignore) {
          console.log("getUsers Response ", body);
          const nonNullOpponents = body.filter((x) => x != null);
          setOpponents(nonNullOpponents);
          const opponentsWithInviteData = await updateIsJoinableStatus(nonNullOpponents);
          //console.log("setting opponentsDisplay to ", opponentsWithInviteData);
          setOpponentsDisplay(opponentsWithInviteData);
        }
      });
    });
    return () => {
      ignore = true;
    };
  }, [authHelper, searchText]);

  const opponentPageSelectorButton = (numOpponents) => {
    // console.log("opponents length: " + opponents.length);
    // console.log("listEnd Index: " + listEndIndex);

    if (numOpponents > 8) {
      if (listStartIndex < diff) {
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
      } else if (listEndIndex < opponents.length - 1) {
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
      <input
        className="search"
        ref={inputFieldRef}
        onChange={(event) => {
          let inputText = event.target.value;
          console.log("inputText: " + inputText);
          setSearchText(inputText);
        }}
      ></input>

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
        {opponentsDisplay.map((opponent, index) => {
          //console.log("opponentDisplay entry ", opponent);
          if (listStartIndex <= index && index <= listEndIndex) {
            let classes = "";
            if (index === listStartIndex) classes = "secondary bottomBorder topBorder leftBorder rightBorder";
            else classes = "secondary bottomBorder leftBorder rightBorder";
            return (
              <OpponentSelectButton
                navigate={navigate}
                styles={{ pointerEvents: "auto" }}
                key={opponent.id}
                opponentInfo={opponent}
                classes={classes}
                authHelper={authHelper}
                currentGameMode={currentGameMode}
                gameInfoSetter={gameInfoSetter}
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
      className={"secondary defaultColor bottomBorder rightBorder " + (noLeftBorder ? "" : "leftBorder ")}
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
