import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import LoginButton from "../components/LoginButton";
import LoginInputButton from "../components/LoginInputButton";

import PAGES from "../enums/pages";
import { useState } from "react";

function Login({ navigate, login }) {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const userCredentials = {
    username: loginUsername,
    password: loginPassword,
  };
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
          onClick={() => {
            //send user back and wipe the input fields
            setLoginUsername("");
            setLoginPassword("");
            navigate(`/${PAGES.INITIAL}`);
          }}
        >
          Back
        </button>
        <LoginButton
          styles={{ flex: 1 }}
          validationFormula={() => {
            let dependencies = [
              { value: loginUsername, minLength: 3 },
              { value: loginPassword, minLength: 6 },
            ];
            return dependencies.every((x) => {
              return x.value.length >= x.minLength;
            });
          }}
          OnClick={async () => {
            await login(userCredentials);
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          height: "88%",
        }}
      >
        <LoginInputButton
          fieldName="Username"
          fieldType="text"
          tabIndex={1}
          stateVar={loginUsername}
          hook={setLoginUsername}
        />
        <LoginInputButton
          fieldName="Password"
          fieldType="password"
          tabIndex={2}
          stateVar={loginPassword}
          hook={setLoginPassword}
        />
      </div>
      <div className="title">RPS</div>
    </>
  );
}

export default Login;
