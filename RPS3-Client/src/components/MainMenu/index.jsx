import { useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";
import { scale } from "svelte/transition";

import Tile from "../Tile";
import Button from "../Button";

const variants = {
  Initial: {
    x: "0vw",
    y: "0vh",
    opacity: 1,
    transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.3 },
  },
  Home: { x: "0vw", y: "0vh", opacity: 1 },
  Local: { x: "0vw", y: "0vh", opacity: 1 },
  Online1: { x: "0vw", y: "0vh", opacity: 1 },
  // hover: { x: "0vw", y: "0vh", opacity: 1, scale: 1.1, transition: { duration: 0.1 } },
};

export default function MainMenu({ displayState, setDisplayState }) {
  return (
    <Tile
      layoutId={"MainMenu"}
      size={"thick"}
      isActive={true}
      initial={{ x: "0vw", y: "10vh", opacity: 0 }} // centered
      animate={displayState}
      variants={variants}
      // transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.3 }}
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
          destination={"Online1"}
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
