import { useState } from "react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";
import TextField from "../TextField";

export default function Login({ displayState, setDisplayState }) {
  return (
    <Tile
      size={"thick"}
      isActive={true}
      onClick={() => {
        setDisplayState("Login");
      }}
    >
      <Button
        text={"LOGIN"}
        textStyle={"labelText"}
        styles={{
          width: "auto",
          alignSelf: "flex-start",
          marginTop: "1rem",
          marginLeft: "1rem",
          padding: "0.1rem 1rem 0.1rem 1rem",
        }}
      >
        LOGIN
      </Button>
      <div style={{ width: "80%", marginTop: "5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <TextField text={"USERNAME"} textStyle="defaultText" focus={true}></TextField>
        <TextField text={"PASSWORD"} styles={{ marginTop: "3.5rem" }} textStyle="defaultText"></TextField>
        <Button
          text={"CREATE USER"}
          textStyle={"defaultText"}
          styles={{ marginTop: "4rem" }}
          setDisplayState={setDisplayState}
          destination={"Create Account"}
        >
          CREATE USER
        </Button>
      </div>
    </Tile>
  );
}
