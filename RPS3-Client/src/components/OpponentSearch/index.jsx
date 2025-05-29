import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

import "../../styles/styles.css";
import useInterval from "../../hooks/useInterval";

import OpponentSearchResult from "../OpponentSearchResult";
import Tile from "../Tile";
import Button from "../Button";
import API_ROUTES from "../../enums/API_Routes";

export default function OpponentSearch({
  setDisplayState,
  matchmakingPreferences,
  userInfo,
  authorizeThenCallHttp,
  setCurrentGameInfo,
}) {
  const [savedPlayers, setSavedPlayers] = useState(() => {
    const recentPlayers = localStorage.getItem("recentPlayers");
    if (recentPlayers) return JSON.parse(recentPlayers);
  });
  const [opponentsList, setOpponentsList] = useState([]);
  const [opponentsDisplayList, setOpponentsDisplayList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [listStartIndex, setListStartIndex] = useState(0); //idk yet
  const diff = 7;
  const listEndIndex = listStartIndex + diff;

  useEffect(() => {
    let ignore = false;
    authorizeThenCallHttp(API_ROUTES.GET_USERS, "POST", {
      searchText: searchText,
      listOfPlayers: savedPlayers,
    }).then((res) => {
      if (res === undefined) return;
      res.json().then(async (body) => {
        if (!ignore) {
          console.log("getUsers Response ", body);
          const nonNullOpponents = body.filter((x) => x != null);
          setOpponentsList(nonNullOpponents);
          const opponentsWithInviteData = await updateIsJoinableStatus(nonNullOpponents);
          //console.log("setting opponentsDisplay to ", opponentsWithInviteData);
          setOpponentsDisplayList(opponentsWithInviteData);
        }
      });
    });
    return () => {
      ignore = true;
    };
  }, [authorizeThenCallHttp, searchText]);

  const updateIsJoinableStatus = useCallback(
    async (opponentsList) => {
      if (opponentsList.length === 0) return opponentsList;

      return await Promise.all(
        opponentsList.map(async (opponent) => {
          // console.log("opponent in updateIsJoinableStatus ", opponent);
          const response = await authorizeThenCallHttp(API_ROUTES.MATCHMAKING.SEARCH.CHECK_INVITE, "POST", {
            otherPlayer_id: opponent.id,
            gameType: matchmakingPreferences.gameType,
            gameMode: matchmakingPreferences.gameMode,
          });
          const isJoinable = await response.json();
          return { ...opponent, isJoinable: isJoinable };
        })
      );
    },
    [authorizeThenCallHttp, matchmakingPreferences]
  );

  useInterval(async () => {
    //console.log("opponents ", opponents);
    // //console.log(opponentsWithInviteData );
    const opponentsWithInviteData = await updateIsJoinableStatus(opponentsList);
    setOpponentsDisplayList(opponentsWithInviteData);
    //console.log("set opponentsDisplay to ", opponentsWithInviteData);
  }, 500);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Tile size={"thick"} isActive={true}>
        <motion.input
          type="search"
          placeholder="SEARCH NAME"
          autoFocus="true"
          initial={{ borderColor: "var(--tileBorderColor_Default)" }}
          whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
          whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
          style={{
            width: "80%",
            marginTop: "2rem",
            padding: "0.1rem 1rem 0.1rem 1rem",
          }}
          className="labelText"
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <div
          style={{
            width: "90%",
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {opponentsDisplayList.length > 0 ? (
            opponentsDisplayList.map((opponent, index) =>
              listStartIndex <= index && index <= listEndIndex && opponent.id != userInfo.userId ? (
                <div style={{ width: "100%" }}>
                  <OpponentSearchResult
                    setDisplayState={setDisplayState}
                    opponentInfo={opponent}
                    authorizeThenCallHttp={authorizeThenCallHttp}
                    matchmakingPreferences={matchmakingPreferences}
                    setCurrentGameInfo={setCurrentGameInfo}
                  ></OpponentSearchResult>
                  {index < listEndIndex ? (
                    <hr style={{ width: "100%", border: "0.1rem solid #b1b1b1", margin: "0 0 0.4rem" }} />
                  ) : null}
                </div>
              ) : null
            )
          ) : (
            <div className="descriptionText">results will appear here</div>
          )}
        </div>
      </Tile>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        <Button
          text={"PREV"}
          textStyle={"labelText"}
          styles={{
            width: "auto",
            marginTop: "2.5rem",
            padding: "0.1rem 2.5rem 0.1rem 2.5rem",
          }}
          onClick={(e) => {
            if (listStartIndex > diff) {
              e.stopPropagation();
              setListStartIndex(listStartIndex - 8);
            }
          }}
        />
        <Button
          text={"NEXT"}
          textStyle={"labelText"}
          styles={{
            width: "auto",
            marginTop: "2.5rem",
            padding: "0.1rem 2.5rem 0.1rem 2.5rem",
          }}
          onClick={(e) => {
            if (listStartIndex < diff && listEndIndex < opponentsList.length - 1) {
              e.stopPropagation();
              setListStartIndex(listStartIndex + 8);
            }
          }}
        />
      </div>
    </div>
  );
}
