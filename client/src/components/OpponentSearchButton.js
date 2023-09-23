import { useState, useRef, useEffect, useCallback } from "react";

import OpponentSelectButton from "../components/OpponentSelectButton";
import API_ROUTES from "../enums/apiRoutes";

function OpponentSearchButton({ authHelper, userId }) {
  const inputFieldRef = useRef(null);
  const isJoinableCheckInterval = useRef(null);
  const [opponents, setOpponents] = useState([]);
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

  const updateIsJoinableStatus = useCallback(
    async (opponentsList) => {
      let isJoinable = false;
      if (opponentsList.length == 0) return opponentsList;
      return await Promise.all(
        opponentsList.map(async (opponent) => {
          // console.log(opponent);
          authHelper(API_ROUTES.MATCHMAKING.SEARCH.CHECK_INVITE, "POST", {
            client_id: userId,
            otherPlayer_id: opponent.id,
          }).then((res) => {
            res.json().then((data) => {
              // console.log(data);
              isJoinable = data;
            });
          });
          // console.log(isJoinable);
          return { ...opponent, isJoinable: isJoinable };
        })
      );
    },
    [authHelper, userId]
  );

  useEffect(() => {
    let ignore = false;
    let dummyListOfRecentPlayers = [
      "9712b392-8f89-4b1f-8e33-8c0bed73d254",
      "1a839909-6155-48e2-aba5-fcdc4bde6186",
    ];

    console.log("useEffect Runs");
    isJoinableCheckInterval.current = setInterval(async () => {
      console.log("opponents ", opponents);
      // const opponentsWithInviteData = await updateIsJoinableStatus(opponents);
      // //console.log(opponentsWithInviteData );
      // setOpponentsDisplay("opponentsWithInviteData ", opponentsWithInviteData);
    }, 5000);

    authHelper(API_ROUTES.GET_USERS, "POST", {
      searchText: searchText,
      listOfPlayers: dummyListOfRecentPlayers,
    }).then(
      (res) => {
        if (res == undefined) return;
        if (!ignore) {
          // console.log(res);
          res.json().then(async (body) => {
            console.log("getUsers Response ", body);
            setOpponents(body);
            const opponentsWithInviteData = await updateIsJoinableStatus(body);
            // console.log("set opponents to ", opponentsWithInviteData);
            setOpponentsDisplay(opponentsWithInviteData);
          });
        }
        return () => {
          clearInterval(isJoinableCheckInterval.current);
          ignore = true;
        };
      },
      (error) => {
        console.error("AuthHelper failed");
      }
    );
  }, [authHelper, opponents, searchText, updateIsJoinableStatus]);

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
          // if (inputText !== "") {
          //   console.log("searching");
          //   setOpponents(
          //     opponents.filter((opponent) => opponent.name.includes(inputText))
          //   );
          // } else if (inputText === "") {
          //   console.log("no more search");
          //   console.log(opponents);

          //   setOpponents(opponents);
          // }
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
                authHelper={authHelper}
                userId={userId}
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
