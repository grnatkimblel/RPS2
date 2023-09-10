import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import pages from "../enums/pages";

import { useState } from "react";
// import { useLocation } from "react-router-dom";

function MainMenu({ navigate, userInfo, accessTokenHook, refreshTokenHook }) {
  // const location = useLocation();
  // const locationState = location.state;

  const [currentGameMode, setCurrentGameMode] = useState({
    gameModeType: "",
    gameMode: "",
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "12%",
        }}
      >
        <button
          style={{ flex: 1 }}
          className={"defaultColor bottomBorder"}
          onClick={() => navigate(`/${pages.ACCOUNT}`)}
        >
          {userInfo.username}
        </button>
        <button
          style={{ flex: 1 }}
          className={"defaultColor bottomBorder leftBorder"}
          onClick={() => {
            accessTokenHook("");
            refreshTokenHook("");
            navigate(`/${pages.INITIAL}`);
          }}
        >
          Logout
        </button>
      </div>
      <div
        style={{
          display: "flex",
          height: "88%",
        }}
      >
        <button style={{ flex: 1 }} className="notInteractableColor">
          Local
        </button>
        <button
          style={{ flex: 1 }}
          className="defaultColor leftBorder"
          onClick={() => navigate(`/${pages.ONLINE.INITIAL}`)}
        >
          Online
        </button>
      </div>
      <div className="title">RPS</div>
    </>
  );
}

export default MainMenu;
