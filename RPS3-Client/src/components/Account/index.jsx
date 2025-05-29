import { useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";

import API_ROUTES from "../../enums/API_Routes";
import DisplayStates from "../../enums/DisplayStates";

export default function Account({
  setDisplayState,
  authorizeThenCallHttp,
  refreshToken,
  setAccessToken,
  setRefreshToken,
  userInfo,
  setUserInfo,
}) {
  return (
    <Tile
      size={"thick"}
      isActive={true}
      onClick={() => {
        setDisplayState("Account");
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
          <Button
            text={"LOGOUT"}
            textStyle={"labelText"}
            onClick={async () => {
              if (userInfo && userInfo.userId) {
                console.log(refreshToken);
                await authorizeThenCallHttp(API_ROUTES.LOGOUT, "DELETE", {
                  refreshToken,
                });
                setAccessToken("");
                setRefreshToken("");
                setUserInfo({
                  username: "",
                  userId: "",
                  emoji: "",
                });
              }
              localStorage.removeItem("lastUserCredentials");
              setDisplayState(DisplayStates.Home);
            }}
          />
        </div>
      </div>
    </Tile>
  );
}
