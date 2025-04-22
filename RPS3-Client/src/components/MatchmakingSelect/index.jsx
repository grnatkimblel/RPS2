import { useState } from "react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";
import CycleButton from "../CycleButton";

export default function MatchmakingSelect({ gamemode, validMatchmakingTypes, setDisplayState }) {
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
          <CycleButton options={["QUICKPLAY", "RANKED"]} textStyle={"defaultText"} />
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
            destination={"Random"}
          />
        </div>
      </div>
      <div></div>
    </Tile>
  );
}
