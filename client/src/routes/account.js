import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";
// import { useLocation } from "react-router-dom";
import pages from "../enums/pages";
import { getNewAccessToken } from "../helper";
import { useState } from "react";

function Account({ navigate, userInfo }) {
  //   const location = useLocation();
  //   const locationState = location.state;

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
          }}
        >
          {/* leftSide */}
          <div className="notInteractableColor account-username">
            {userInfo.username}
          </div>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
            className="notInteractableColor flex-container"
          >
            <div>Win/Loss: {0.0}</div>
            <div>Rock: {0.0}%</div>
            <div>Paper: {0.0}%</div>
            <div>Scissors: {0.0}%</div>
          </div>
        </div>

        {/* rightSide */}
        <button
          style={{ flex: 1 }}
          className="defaultColor leftBorder"
          onClick={() => navigate(`/${pages.MAIN_MENU}`)}
        >
          Back
        </button>
      </div>

      <div className="title">RPS</div>
    </>
  );
}

export default Account;
