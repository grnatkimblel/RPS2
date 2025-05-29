import { useState, useCallback } from "react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";
import CycleButton from "../CycleButton";

import API_ROUTES from "../../enums/API_Routes";
import { GAMEMODES, GAMEMODE_TYPES, MATCHMAKING_TYPES } from "../../shared/enums/gameEnums"; //This file name is set in docker compose
import DisplayStates from "../../enums/DisplayStates";

export default function MatchmakingSelect({
  gamemode,
  validMatchmakingTypes,
  setDisplayState,
  authorizeThenCallHttp,
  gameInfoSetter,
}) {
  const [gameType, setGameType] = useState("Quickplay");

  const randomMatchmaking = useCallback(() => {
    authorizeThenCallHttp(API_ROUTES.MATCHMAKING.ADD_PLAYER, "POST", {
      gameType: gameType,
      gameMode: gamemode,
      matchmakingType: MATCHMAKING_TYPES.RANDOM,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.roster);
        const apiRoute =
          gamemode === GAMEMODES.QUICKDRAW
            ? API_ROUTES.GAME.QUICKDRAW.PREGAME
            : gamemode === GAMEMODES.TDM
            ? API_ROUTES.GAME.TDM.PREGAME
            : null;
        return authorizeThenCallHttp(apiRoute, "POST", { gameType: gamemode, roster: data.roster });
      })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        gameInfoSetter(data);
        setDisplayState(DisplayStates.Quickdraw_Arena_Online);
      })
      .catch((err) => console.log(err));
  }, [gameType, gameInfoSetter, setDisplayState]);

  return (
    <Tile
      size={"slim"}
      isActive={true}
      onClick={() => {
        setDisplayState("Online Matchmaking:" + gamemode);
      }}
    >
      <div style={{ width: "80%", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="labelText">{gamemode.toUpperCase()}</p>
          {/* <CycleButton options={["Quickplay", "Ranked"]} textStyle={"defaultText"} setGameType={setGameType} /> */}
          <CycleButton options={["Quickplay"]} textStyle={"defaultText"} setGameType={setGameType} />
        </div>
        <div
          style={{ width: "100%", marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <p className="labelText">OPPONENT</p>
          <Button text={"SEARCH"} textStyle={"defaultText"} setDisplayState={setDisplayState} destination={"Search"} />
          <Button
            text={"RANDOM"}
            textStyle={"defaultText"}
            styles={{ marginTop: "2rem" }}
            setDisplayState={setDisplayState}
            onClick={randomMatchmaking}
          />
        </div>
      </div>
      <div></div>
    </Tile>
  );
}
