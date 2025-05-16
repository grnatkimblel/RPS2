import { useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";

export default function Settings({ displayState, setDisplayState, soundVolume, setSoundVolume }) {
  return (
    <Tile
      size={"thick"}
      isActive={true}
      onClick={() => {
        setDisplayState("Settings");
      }}
    >
      <motion.button
        className={"labelText"}
        onClick={(event) => {
          event.stopPropagation();
          setDisplayState("Home");
        }}
        style={{
          width: "auto",
          alignSelf: "flex-start",
          marginTop: "1rem",
          marginLeft: "1rem",
          padding: "0.1rem 1rem 0.1rem 1rem",
        }}
        whileHover={{
          scale: 1.05,
        }}
      >
        BACK
      </motion.button>
      <div
        style={{
          width: "90%",
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
          <p className="labelText">VOLUME</p>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.01"
            value={soundVolume}
            onChange={(event) => {
              setSoundVolume(event.target.value);
            }}
          />
        </div>
      </div>
    </Tile>
  );
}
