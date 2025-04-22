import { useState, useEffect, useRef } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";
import CycleButton from "../CycleButton";
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
          <p className="labelText" style={{ marginTop: "1rem", marginBottom: "0rem" }}>
            NAME
          </p>
          <motion.input
            type="text"
            defaultValue="PLAYER 1"
            required
            minlength="1"
            maxLength="20"
            className="defaultText"
            tabIndex="1"
            autoFocus="true"
            initial={{ borderColor: "var(--tileBorderColor_Default)" }}
            whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
            whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
            style={{ marginTop: "1rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
          />
          <motion.input
            type="text"
            defaultValue="PLAYER 2"
            required
            minlength="1"
            maxLength="20"
            className="defaultText"
            tabIndex="2"
            initial={{ borderColor: "var(--tileBorderColor_Default)" }}
            whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
            whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
            style={{ marginTop: "2rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
          />
        </div>
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "1rem" }}
        >
          <p className="labelText" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            GAMEMODES
          </p>
          <CycleButton
            options={["QUICKDRAW", "TDM"]}
            textStyle="defaultText"
            styles={{ width: "100%", marginTop: "0rem", marginBottom: "2rem" }}
          />
          <Button text={"GO"} textStyle={"defaultText"} />
        </div>
      </div>
      <div></div>
    </Tile>
  );
}
