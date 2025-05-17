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
          <p className="labelText">VOLUME:</p>
          <p className="labelText">{`${Math.ceil(soundVolume * 100)}`}</p>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={soundVolume}
            onChange={(event) => {
              console.log(event.target.value);
              setSoundVolume(event.target.value);
            }}
          />
        </div>
        <Button
          text={"CLEAR LOCAL USERS"}
          textStyle={"labelText"}
          onClick={() => {
            let localPlayerUsernames = JSON.parse(localStorage.getItem("localPlayerUsernames") || "[]");
            localPlayerUsernames.map((username) => {
              localStorage.removeItem(username);
            });
            localStorage.removeItem("localPlayerUsernames");
          }}
        />
        {/* <input
          type="color"
          onChange={(event) => {
            console.log(event.target.value);
          }}
        /> */}
      </div>
    </Tile>
  );
}
