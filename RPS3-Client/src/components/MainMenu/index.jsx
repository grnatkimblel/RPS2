import { useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import DisplayStates from "../../enums/DisplayStates.ts";

import Tile from "../Tile";
import Button from "../Button";

export default function MainMenu({ displayState, setDisplayState, userInfo }) {
  return (
    <Tile
      size={"thick"}
      isActive={true}
      onClick={() => {
        setDisplayState(DisplayStates.Home);
      }}
    >
      <motion.button
        className={"labelText"}
        onClick={(event) => {
          event.stopPropagation();
          if (userInfo.userId) {
            setDisplayState(DisplayStates.Account);
          } else if (displayState !== DisplayStates.Login) {
            setDisplayState(DisplayStates.Login);
          }
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
        {userInfo.userId ? userInfo.username : displayState !== DisplayStates.Login ? "LOGIN" : "..."}
        {/* {"COMING SOON"} */}
      </motion.button>
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
          destination={DisplayStates.Local}
          styles={{ marginTop: "2.5rem" }}
        />
        <Button
          text={"ONLINE"}
          textStyle={"defaultText"}
          setDisplayState={setDisplayState}
          destination={DisplayStates.Online_Gamemodes}
          styles={{ marginTop: "2.5rem" }}
        />
        <Button
          text={"SETTINGS"}
          textStyle={"defaultText"}
          setDisplayState={setDisplayState}
          destination={DisplayStates.Settings}
          styles={{ marginTop: "2.5rem" }}
        />
      </div>
    </Tile>
  );
}
