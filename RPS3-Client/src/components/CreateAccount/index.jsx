import { useState } from "react";
import "../../styles/styles.css";
import { motion } from "motion/react";

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
      />
      <div style={{ width: "80%", marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.input
          type="text"
          placeholder="USERNAME"
          required
          minLength="1"
          maxLength="20"
          className="defaultText"
          tabIndex="1"
          autoFocus="true"
          initial={{ borderColor: "var(--tileBorderColor_Default)" }}
          whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
          whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
          style={{ marginTop: "2.5rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
        />
        <motion.input
          type="password"
          placeholder="PASSWORD"
          required
          minLength="1"
          maxLength="20"
          className="defaultText"
          tabIndex="2"
          initial={{ borderColor: "var(--tileBorderColor_Default)" }}
          whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
          whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
          style={{ marginTop: "2.5rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
        />
        <motion.input
          type="password"
          placeholder="PASSWORD"
          required
          minLength="1"
          maxLength="20"
          className="defaultText"
          tabIndex="3"
          initial={{ borderColor: "var(--tileBorderColor_Default)" }}
          whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
          whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
          style={{ marginTop: "2.5rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
        />
      </div>
      <div></div>
    </Tile>
  );
}
