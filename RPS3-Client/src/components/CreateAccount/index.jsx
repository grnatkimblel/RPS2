import { useState } from "react";
import "../../styles/styles.css";
import { motion } from "motion/react";

import Tile from "../Tile";
import Button from "../Button";

import API_ROUTES from "../../enums/API_Routes.ts";

export default function CreateAccount({ loginHelper, authorizeThenCallHttp, setDisplayState }) {
  const [createAccountUsername, setCreateAccountUsername] = useState("");
  const [createAccountInitialPassword, setCreateAccountInitialPassword] = useState("");
  const [createAccountConfirmPassword, setCreateAccountConfirmPassword] = useState("");

  const userCredentials = {
    username: createAccountUsername,
    password: createAccountConfirmPassword,
  };

  function validateInput(username, password1, password2) {
    if (username.length < 3 || username.length > 20) {
      alert("Username must be between 3 and 20 characters.");
      return false;
    }
    if (password1.length < 6 || password1.length > 20 || password2.length < 6 || password2.length > 20) {
      alert("Password must be between 6 and 20 characters.");
      return false;
    }
    if (password1 !== password2) {
      alert("Passwords do not match.");
      return false;
    }
    return true;
  }

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
        onClick={async () => {
          console.log("Create Account Button Clicked");

          if (!validateInput(createAccountUsername, createAccountInitialPassword, createAccountConfirmPassword)) {
            console.log("Validation failed");
            return;
          }
          try {
            console.log("Creating account with:", userCredentials);
            let res = await fetch(API_ROUTES.REGISTER, {
              headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify(userCredentials),
            });
            console.log(userCredentials);
            if (res.status === 201) {
              await loginHelper(userCredentials);
            } else if (res.status === 409) {
              alert("Username already taken.\nTry another username.");
            }
          } catch (error) {
            console.error("An error occurred:", error);
          }
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
          onChange={(e) => {
            setCreateAccountUsername(e.target.value);
          }}
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
          onChange={(e) => {
            setCreateAccountInitialPassword(e.target.value);
          }}
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
          onChange={(e) => {
            setCreateAccountConfirmPassword(e.target.value);
          }}
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
