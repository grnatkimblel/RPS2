import { useState, useEffect, useRef } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";

export default function LocalMenu({ displayState, setDisplayState }) {
  const previousDisplayState = useRef();
  const currentDisplayState = useRef(displayState);

  const exitDisplayState = usePresenceData();

  useEffect(() => {
    previousDisplayState.current = currentDisplayState.current;
    currentDisplayState.current = displayState;
  }, [displayState]);

  const initialPositions = {};

  const displayVariants = {
    Local: { x: "0vw", y: "0vh", opacity: 1 },
  };
  const exitVariants = {
    Home: { x: "10vw", y: "0vh", opacity: 0 }, // exit animation when going back to Home
    Local: { x: "10vw", y: "0vh", opacity: 0 }, // exit animation when going back to Local
    Online: { x: "0vw", y: "10vh", opacity: 0 }, // exit animation when going back to Local
  };

  return (
    <Tile
      layoutId={"GameMenu"}
      size={"slim"}
      isActive={true}
      initial={{ x: "10vw", y: "0vh", opacity: 0 }} // centered
      animate={displayState}
      exit={exitVariants[exitDisplayState]}
      variants={displayVariants}
      onClick={() => {
        setDisplayState("Local");
      }}
    >
      <div style={{ width: "80%", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="labelText">NAME</p>
          <Button text={"PLAYER 1"} textStyle="defaultText">
            PLAYER 1
          </Button>
          <Button text={"PLAYER 2"} styles={{ marginTop: "2.5rem" }} textStyle="defaultText">
            PLAYER 2
          </Button>
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
