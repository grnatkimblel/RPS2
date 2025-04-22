import { useState, useEffect, useRef } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";
import TextField from "../TextField";

export default function LocalMenu({ displayState, setDisplayState }) {
  return (
    <Tile
      size={"slim"}
      isActive={true}
      onClick={() => {
        setDisplayState("Local");
      }}
    >
      <div style={{ width: "80%", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="labelText">NAME</p>
          <TextField text={"PLAYER 1"} textStyle="defaultText" focus={true}></TextField>
          <TextField text={"PLAYER 2"} styles={{ marginTop: "2.5rem" }} textStyle="defaultText"></TextField>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <p className="labelText">GAMEMODES</p>
          <Button text={"QUICKDRAW"} textStyle="defaultText">
            QUICKDRAW
          </Button>
        </div>
      </div>
      <div></div>
    </Tile>
  );
}
