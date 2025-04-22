import { useState } from "react";
import "../../styles/styles.css";

import Tile from "../Tile";
import Button from "../Button";
import TextField from "../TextField";

export default function CreateAccount({}) {
  return (
    <Tile
      size={"thick"}
      isActive={true}
      onClick={() => {
        setDisplayState("Create Account");
      }}
    >
      <Button
        text={"CREATE USER"}
        textStyle={"labelText"}
        styles={{
          width: "auto",
          alignSelf: "flex-start",
          marginTop: "1rem",
          marginLeft: "1rem",
          padding: "0.1rem 1rem 0.1rem 1rem",
        }}
      >
        CREATE USER
      </Button>
      <div style={{ width: "80%", marginTop: "6rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <TextField text={"USERNAME"} textStyle="defaultText" focus={true}></TextField>
        <TextField text={"PASSWORD"} textStyle="defaultText" styles={{ marginTop: "3rem" }}></TextField>
        <TextField text={"PASSWORD"} textStyle="defaultText" styles={{ marginTop: "2rem" }}></TextField>
      </div>
      <div></div>
    </Tile>
  );
}
