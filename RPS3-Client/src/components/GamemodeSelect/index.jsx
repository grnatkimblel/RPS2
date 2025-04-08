import { useState } from "react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";

export default function GamemodeSelect({}) {
  return (
    <Tile size="slim" isActive={true}>
      <div style={{ width: "80%", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="labelText">GAMEMODES</p>
          <Button text={"QUICKDRAW"} textStyle="defaultText"></Button>
          <Button text={"TDM"} styles={{ marginTop: "3.5rem" }} textStyle="defaultText"></Button>
          <Button text={"S&D"} styles={{ marginTop: "3.5rem" }} textStyle="defaultText"></Button>
        </div>
      </div>
      <div></div>
    </Tile>
  );
}
