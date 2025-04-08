import { useState } from "react";
import "../../styles/styles.css";

export default function Login({}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} className="activeBorder localMenu">
      <button
        style={{
          alignSelf: "flex-start",
          marginTop: "1.5rem",
          marginLeft: "1.5rem",
          padding: "0.1rem 1rem 0.1rem 1rem",
        }}
        className="activeBorder labelText"
      >
        LOGIN
      </button>
      <div style={{ width: "80%", marginTop: "7rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button style={{ width: "100%" }} className="defaultBorder defaultText">
          USERNAME
        </button>
        <button style={{ width: "100%", marginTop: "3.5rem" }} className="defaultBorder defaultText">
          PASSWORD
        </button>
        <button style={{ width: "100%", marginTop: "7rem" }} className="activeBorder defaultText">
          CREATE USER
        </button>
      </div>
      <div></div>
    </div>
  );
}

// <Login
//   onLoginSuccess={() => setDisplayState("MainMenu")}
//   onCreateAccount={() => setDisplayState("CreateAccount")}
// />
