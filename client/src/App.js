import "./styles/buttonStyles.css";
import "./styles/texts.css";
import "./styles/elementSpecific.css";

import LoginButton from "./components/LoginButton";
import LoginInputButton from "./components/LoginInputButton";
import GameModeSelector from "./components/GameModeSelector";

import apiRoutes from "./apiRoutes";

import pages from "./enums/pages";
import { gameModeTypes } from "./enums/gameEnums";

import { useState } from "react";

function App() {
  const [currentPage, setCurrentPage] = useState(pages.INITIAL);
  const [currentGameMode, setCurrentGameMode] = useState({
    gameModeType: "",
    gameMode: "",
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [createAccountUsername, setCreateAccountUsername] = useState("");
  const [createAccountInitialPassword, setCreateAccountInitialPassword] =
    useState("");
  const [createAccountConfirmPassword, setCreateAccountConfirmPassword] =
    useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const userCredentials = {
    username: loginUsername ? loginUsername : createAccountUsername,
    password: loginPassword ? loginPassword : createAccountConfirmPassword,
  };

  switch (currentPage) {
    case pages.INITIAL: // [✔️] flexing
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button
            style={{ flex: 1 }}
            className="defaultColor redTextBorder smooth-16"
            onClick={() => setCurrentPage(pages.LOGIN)}
          >
            Login
          </button>
          <button
            style={{ flex: 1 }}
            className="defaultColor leftBorder redTextBorder smooth-16"
            onClick={() => setCurrentPage(pages.CREATE_ACCOUNT)}
          >
            Create Account
          </button>
          <div className="title">RPS</div>
        </div>
      );
    case pages.LOGIN: // [✔️] flexing
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
                setCurrentPage(pages.INITIAL);
              }}
            >
              Back
            </button>
            <LoginButton
              styles={{ flex: 1 }} //
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
                const loginResponse = await attemptLogin(userCredentials);
                setAccessToken(loginResponse.accessToken);
                setRefreshToken(loginResponse.refreshToken);
                // setLoginUsername("");
                // setLoginPassword("");
                setCurrentPage(pages.MAIN_MENU);
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
    case pages.CREATE_ACCOUNT: // [✔️] flexing
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
                //send user back and clear input fields
                setCreateAccountUsername("");
                setCreateAccountInitialPassword("");
                setCreateAccountConfirmPassword("");
                setCurrentPage(pages.INITIAL);
              }}
            >
              Back
            </button>
            <LoginButton
              styles={{ flex: 1 }}
              validationFormula={() => {
                //console.log("Validation formula running");
                let dependencies = [
                  { value: createAccountUsername, minLength: 3 },
                  { value: createAccountInitialPassword, minLength: 6 },
                  { value: createAccountConfirmPassword, minLength: 6 },
                ];
                //console.log("dependencies");
                //console.log(dependencies);

                let minLengthSatisfied = dependencies.every((x) => {
                  return x.value.length >= x.minLength;
                });
                let passwordsMatch =
                  dependencies[1].value === dependencies[2].value;
                // console.log("passwords Match");
                // console.log(passwordsMatch);
                // console.log("");
                return minLengthSatisfied && passwordsMatch;
              }}
              OnClick={async () => {
                // console.log("createAccountUsername:" + createAccountUsername);
                // console.log(
                //   "createAccountConfirmPassword:" + createAccountConfirmPassword
                // );
                // console.log("userCredentials:");
                // console.log(userCredentials);
                // console.log("STRINGIFY OUTPUT:");
                // console.log(JSON.stringify(userCredentials));
                let res = await fetch(apiRoutes.register, {
                  headers: {
                    "Content-Type": "application/json",
                  },
                  method: "POST",
                  body: JSON.stringify(userCredentials),
                });
                console.log("Status:" + res.status);
                if (res.status == 200) {
                  const loginResponse = await attemptLogin(userCredentials);
                  setAccessToken(loginResponse.accessToken);
                  setRefreshToken(loginResponse.refreshToken);
                  // setCreateAccountUsername("");
                  // setCreateAccountInitialPassword("");
                  // setCreateAccountConfirmPassword("");
                  setCurrentPage(pages.MAIN_MENU);
                } else {
                  alert("Error Code: " + res.status);
                }
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
              fieldName={"Create Username"}
              fieldType="text"
              tabIndex={1}
              stateVar={createAccountUsername}
              hook={setCreateAccountUsername}
            />
            <LoginInputButton
              fieldName={"Create Password"}
              fieldType="password"
              tabIndex={2}
              stateVar={createAccountInitialPassword}
              hook={setCreateAccountInitialPassword}
            />
            <LoginInputButton
              fieldName={"Confirm Password"}
              fieldType="password"
              tabIndex={3}
              stateVar={createAccountConfirmPassword}
              hook={setCreateAccountConfirmPassword}
            />
          </div>
        </>
      );
    case pages.MAIN_MENU: // [✔️] flexing
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
              onClick={() => setCurrentPage(pages.ACCOUNT)}
            >
              {userCredentials.username}
            </button>
            <button
              style={{ flex: 1 }}
              className={"defaultColor bottomBorder leftBorder"}
              onClick={() => {
                setLoginUsername("");
                setLoginPassword("");
                setCreateAccountUsername("");
                setCreateAccountInitialPassword("");
                setCreateAccountConfirmPassword("");
                setAccessToken("");
                setRefreshToken("");
                setCurrentPage(pages.INITIAL);
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
              onClick={() => setCurrentPage(pages.ONLINE.INITIAL)}
            >
              Online
            </button>
          </div>
          <div className="title">RPS</div>
        </>
      );
    case pages.ACCOUNT: // [✔️] flexing
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
                {userCredentials.username}
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
              onClick={() => setCurrentPage(pages.MAIN_MENU)}
            >
              Back
            </button>
          </div>

          <div className="title">RPS</div>
        </>
      );
    case pages.ONLINE.INITIAL: // [✔️] flexing
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button
            style={{ flex: 1 }}
            className="defaultColor"
            onClick={() => setCurrentPage(pages.MAIN_MENU)}
          >
            Back
          </button>
          <div
            style={{ display: "flex", flex: 1, flexDirection: "column" }}
            className="leftBorder"
          >
            <GameModeSelector
              gameModeSetter={setCurrentGameMode}
              gameModeType={gameModeTypes.QUICKPLAY}
              bonusStyles="bottomBorder"
              pageSetter={setCurrentPage}
            />
            <GameModeSelector
              gameModeSetter={setCurrentGameMode}
              gameModeType={gameModeTypes.RANKED}
              pageSetter={setCurrentPage}
            />
          </div>
        </div>
      );
    case pages.ONLINE.GAMEMODE_CHOSEN:
      //console.log(currentGamemode.gamemodeType);
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button
            style={{ flex: 1 }}
            className="defaultColor"
            onClick={() => setCurrentPage(pages.ONLINE.INITIAL)}
          >
            Back
          </button>
          <div
            style={{
              flexDirection: "column",
              flex: 1,
              display: "flex",
              height: "100%",
            }}
            className="leftBorder"
          >
            <div className="gamemode-smalltext">
              {currentGameMode.gameModeType}
            </div>
            <button
              style={{ flex: 1 }}
              className="notInteractableColor bottomBorder"
            >
              {currentGameMode.gameMode}
            </button>
            <button style={{ flex: 3 }} className="defaultColor bottomBorder">
              Search Opponent
            </button>
            <button
              style={{ flex: 3 }}
              className="defaultColor"
              onClick={() => setCurrentPage(pages.ONLINE.OPPONENT_TYPE_CHOSEN)}
            >
              Random Opponent
            </button>
          </div>
        </div>
      );
    case pages.ONLINE.OPPONENT_TYPE_CHOSEN:
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <button style={{ flex: 1 }} className="notInteractableColor">
            Back
          </button>
          <div
            style={{
              flexDirection: "column",
              flex: 1,
              display: "flex",
              height: "100%",
            }}
            className="leftBorder"
          >
            <div className="gamemode-smalltext">
              {currentGameMode.gameModeType}
            </div>
            <button
              style={{ flex: 1 }}
              className="notInteractableColor bottomBorder"
            >
              {currentGameMode.gameMode}
            </button>
            <button
              style={{ flex: 3 }}
              className="notInteractableColor bottomBorder"
            >
              Searching...
            </button>
            <button
              style={{ flex: 3 }}
              className="defaultColor"
              onClick={() => setCurrentPage(pages.ONLINE.GAMEMODE_CHOSEN)}
            >
              Cancel
            </button>
          </div>
        </div>
      );

    default:
      console.log("Page set to invalid case");
  }
}

async function attemptLogin(credentials) {
  // console.log("Login Attempt");
  // console.log(credentials);
  let res = await fetch(apiRoutes.login, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(credentials),
  });
  let body = await res.json();
  console.log(body);
  return body;
}

export default App;
