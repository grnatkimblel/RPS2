import { useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";
import { scale } from "svelte/transition";

import Tile from "../Tile";
import Button from "../Button";

export default function MainMenu({ displayState, setDisplayState }) {
  return (
    <Tile
      size={"thick"}
      isActive={true}
      onClick={() => {
        setDisplayState("Home");
      }}
    >
      <Button
        text={"LOGIN"}
        textStyle={"labelText"}
        setDisplayState={setDisplayState}
        destination={"Login"}
        styles={{
          width: "auto",
          alignSelf: "flex-start",
          marginTop: "1rem",
          marginLeft: "1rem",
          padding: "0.1rem 1rem 0.1rem 1rem",
        }}
      ></Button>
      <div
        style={{
          width: "60%",
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          text={"PLAY"}
          textStyle={"defaultText"}
          setDisplayState={setDisplayState}
          destination={"Local"}
          styles={{ marginTop: "2.5rem" }}
        ></Button>
        <Button
          text={"ONLINE"}
          textStyle={"defaultText"}
          setDisplayState={setDisplayState}
          destination={"Online Gamemodes"}
          styles={{ marginTop: "2.5rem" }}
        ></Button>
        <Button
          text={"SETTINGS"}
          textStyle={"defaultText"}
          setDisplayState={setDisplayState}
          destination={"Settings"}
          styles={{ marginTop: "2.5rem" }}
        ></Button>
      </div>
    </Tile>
  );
}
