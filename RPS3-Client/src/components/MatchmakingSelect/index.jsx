import { useState } from "react";
import "../../styles/styles.css";

export default function MatchmakingSelect({}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} className="activeBorder localMenu">
      <div style={{ width: "80%", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="labelText">QUICKDRAW</p>
          <button style={{ width: "100%" }} className="defaultBorder defaultText">
            QUICKPLAY
          </button>
        </div>
        <div
          style={{ width: "100%", marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <p className="labelText">OPPONENT</p>
          <button style={{ width: "100%" }} className="activeBorder defaultText">
            SEARCH
          </button>
          <button style={{ width: "100%", marginTop: "3.5rem" }} className="activeBorder defaultText">
            RANDOM
          </button>
        </div>
      </div>
      <div></div>
    </div>
  );
}
