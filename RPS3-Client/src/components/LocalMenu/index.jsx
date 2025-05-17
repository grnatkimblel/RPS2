import { useState, useEffect, useRef } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import DisplayStates from "../../enums/DisplayStates";

import Tile from "../Tile";
import Button from "../Button";
import CycleButton from "../CycleButton";
import TextField from "../TextField";

export default function LocalMenu({ displayState, setDisplayState, setLocalPlayer1Name, setLocalPlayer2Name }) {
  const [player1Name, setPlayer1Name] = useState("PLAYER 1");
  const [player2Name, setPlayer2Name] = useState("PLAYER 2");

  return (
    <Tile size={"slim"} isActive={true}>
      <div style={{ width: "80%", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="labelText" style={{ marginTop: "1rem", marginBottom: "0rem" }}>
            NAME
          </p>
          <motion.input
            type="search"
            defaultValue="PLAYER 1"
            required
            minLength="1"
            maxLength="20"
            list="localPlayerUsernames"
            className="defaultText"
            tabIndex="1"
            autoFocus="true"
            initial={{ borderColor: "var(--tileBorderColor_Default)" }}
            whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
            whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
            onChange={(event) => {
              setPlayer1Name(event.target.value);
            }}
            style={{ marginTop: "1rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
          />
          <motion.input
            type="search"
            defaultValue="PLAYER 2"
            required
            minLength="1"
            maxLength="20"
            list="localPlayerUsernames"
            className="defaultText"
            tabIndex="2"
            initial={{ borderColor: "var(--tileBorderColor_Default)" }}
            whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
            whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
            onChange={(event) => {
              setPlayer2Name(event.target.value);
            }}
            style={{ marginTop: "2rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
          />
          <datalist id="localPlayerUsernames">
            {localStorage.getItem("localPlayerUsernames") &&
              JSON.parse(localStorage.getItem("localPlayerUsernames")).map((username) => {
                return (
                  <option key={username} value={username}>
                    {username}
                  </option>
                );
              })}
          </datalist>
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
          <motion.button
            className={"defaultText"}
            style={{ width: "auto" }}
            transition={{ duration: 0.05 }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{ y: 5 }}
            onClick={(event) => {
              event.stopPropagation();
              player1Name === "" ? setLocalPlayer1Name("PLAYER 1") : setLocalPlayer1Name(player1Name);
              player2Name === "" ? setLocalPlayer2Name("PLAYER 2") : setLocalPlayer2Name(player2Name);

              setDisplayState(DisplayStates.Quickdraw_Arena_Local);
            }}
          >
            GO
          </motion.button>
        </div>
      </div>
      <div></div>
    </Tile>
  );
}
