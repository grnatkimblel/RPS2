import "./styles/layouts.css";
import "./styles/texts.css";
import "./styles/colors.css";

import { useState } from "react";

function App() {
  const [currentPage, setCurrentPage] = useState("Initial");
  const [userCredentials, setUserCredentials] = useState({
    username: "",
    password: "",
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [createAccountUsername, setCreateAccountUsername] = useState("");
  const [createAccountInitialPassword, setCreateAccountInitialPassword] =
    useState("");
  const [createAccountConfirmPassword, setCreateAccountConfirmPassword] =
    useState("");

  switch (currentPage) {
    case "Initial":
      return (
        <>
          <button
            className="defaultColor fillParent leftHalf redTextBorder smooth-16"
            onClick={() => setCurrentPage("Login")}
          >
            Login
          </button>
          <button
            className="defaultColor fillParent rightHalf hideOverflow leftSideDashedBorder redTextBorder smooth-16"
            onClick={() => setCurrentPage("CreateAccount")}
          >
            Create Account
          </button>
          <div className="title">RPS</div>
        </>
      );
    case "Login":
      return (
        <>
          <TopLink
            styles={
              "topOption defaultColor bottomSideDashedBorder leftHalf redTextBorder smooth-16"
            }
            changePage={() => {
              //send user back and wipe the input fields
              setLoginUsername("");
              setLoginPassword("");
              setCurrentPage("Initial");
            }}
            text="Back"
          />
          <button
            style={{ cursor: "text" }}
            className="defaultColor leftHalf fillWithOption"
            onClick={() => document.getElementById("LoginUserName").focus()}
          >
            <p className="login redTextBorder smooth-16">Username</p>
            <InputField
              value={loginUsername}
              onChange={(event) => setLoginUsername(event.target.value)}
              title="Must be at least 3 characters"
              type="text"
              minLength="3"
              id="LoginUserName"
              tabIndex="1"
            />
          </button>
          <Login
            validationFormula={() => {
              let dependencies = [
                { value: loginUsername, minLength: 3 },
                { value: loginPassword, minLength: 6 },
              ];
              return dependencies.every((x) => {
                return x.value.length >= x.minLength;
              });
            }}
            OnClick={() => {
              setUserCredentials({
                username: loginUsername,
                password: loginPassword,
              });
              setLoginUsername("");
              setLoginPassword("");
              setCurrentPage("MainMenu");
            }}
          />
          <button
            style={{ cursor: "text" }}
            className="defaultColor rightHalf fillWithOption leftSideDashedBorder"
            onClick={() => document.getElementById("LoginPassword").focus()}
          >
            <p className="login redTextBorder smooth-16">Password</p>
            <InputField
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              title="Must be at least 6 characters"
              type="password"
              minLength="6"
              id="LoginPassword"
              tabIndex="2"
            />
          </button>

          <div className="title">RPS</div>
        </>
      );
    case "CreateAccount":
      let buttonClasses =
        "defaultColor thirdPageWidth rightSideDashedBorder cursorText fillWithOption createAccountBoxesCrutch";
      let testClasses = "login redTextBorder smooth-16";

      return (
        <>
          <TopLink
            styles={
              "topOption defaultColor bottomSideDashedBorder leftHalf redTextBorder smooth-16"
            }
            changePage={() => {
              //send user back and clear input fields
              setCreateAccountUsername("");
              setCreateAccountInitialPassword("");
              setCreateAccountConfirmPassword("");
              setCurrentPage("Initial");
            }}
            text="Back"
          />
          <Login
            validationFormula={() => {
              let dependencies = [
                { value: createAccountUsername, minLength: 3 },
                { value: createAccountInitialPassword, minLength: 6 },
                { value: createAccountConfirmPassword, minLength: 6 },
              ];

              let minLengthSatisfied = dependencies.every((x) => {
                return x.value.length >= x.minLength;
              });
              let passwordsMatch =
                dependencies.createAccountInitialPassword ===
                dependencies.createAccountConfirmPassword;
              return minLengthSatisfied && passwordsMatch;
            }}
            OnClick={() => {
              setUserCredentials({
                username: createAccountUsername,
                password: createAccountConfirmPassword,
              });
              setCreateAccountUsername("");
              setCreateAccountInitialPassword("");
              setCreateAccountConfirmPassword("");
              setCurrentPage("MainMenu");
            }}
          />
          <>
            <button
              className={buttonClasses}
              onClick={() => {
                document.getElementById("CreateAccountUsername").focus();
              }}
            >
              <p className={testClasses}>
                Create <br></br> Username
              </p>
              <InputField
                value={createAccountUsername}
                onChange={(event) =>
                  setCreateAccountUsername(event.target.value)
                }
                title="Must be at least 3 characters"
                type="text"
                minLength="3"
                id="CreateAccountUsername"
                tabIndex="1"
              />
            </button>
            {/* */}
            <button
              className={buttonClasses}
              onClick={() => {
                document.getElementById("CreateAccountInitialPassword").focus();
              }}
            >
              <p className={testClasses}>
                Create <br></br> Password
              </p>
              <InputField
                value={createAccountInitialPassword}
                onChange={(event) =>
                  setCreateAccountInitialPassword(event.target.value)
                }
                title="Must be at least 6 characters"
                type="password"
                minLength="6"
                id="CreateAccountInitialPassword"
                tabIndex="2"
              />
            </button>
            {/* */}
            <button
              className={buttonClasses}
              onClick={() => {
                document.getElementById("CreateAccountConfirmPassword").focus();
              }}
            >
              <p className={testClasses}>
                Confirm <br></br> Password
              </p>
              <InputField
                value={createAccountConfirmPassword}
                onChange={(event) =>
                  setCreateAccountConfirmPassword(event.target.value)
                }
                title="Must be at least 6 characters"
                type="password"
                minLength="6"
                id="CreateAccountConfirmPassword"
                tabIndex="3"
              />
            </button>
          </>
        </>
      );
    case "MainMenu":
      return (
        <>
          <TopLink
            styles={
              "topOption defaultColor bottomSideDashedBorder leftHalf redTextBorder smooth-16"
            }
            changePage={() => setCurrentPage("Account")}
            text={userCredentials.username}
          />
          <TopLink
            styles={
              "topOption defaultColor bottomSideDashedBorder rightHalf leftSideDashedBorder redTextBorder smooth-16"
            }
            changePage={() => setCurrentPage("Initial")}
            text="Logout"
          />
          <button className="notInteractableColor fillWithOption leftHalf blackTextBorder smooth-16">
            Local
          </button>
          <button
            className="defaultColor fillWithOption rightHalf leftSideDashedBorder redTextBorder smooth-16"
            onClick={() => setCurrentPage("Online")}
          >
            Online
          </button>
          <div className="title">RPS</div>
        </>
      );
    case "Account":
      return (
        <>
          {/* leftSide */}
          <div className="notInteractableColor account-username blackTextBorder smooth-16">
            {userCredentials.username}
          </div>
          <div className="notInteractableColor fillParent leftHalf flex-container blackTextBorder smooth-16">
            <div>Win/Loss: {0.0}</div>
            <div>Rock: {0.0}%</div>
            <div>Paper: {0.0}%</div>
            <div>Scissors: {0.0}%</div>
          </div>

          {/* rightSide */}
          <button
            className="defaultColor fillParent rightHalf leftSideDashedBorder redTextBorder smooth-16"
            onClick={() => setCurrentPage("MainMenu")}
          >
            Back
          </button>
          <div className="title">RPS</div>
        </>
      );
    case "Online":
      return (
        <>
          <button
            className="defaultColor fillParent leftHalf redTextBorder smooth-16"
            onClick={() => setCurrentPage("MainMenu")}
          >
            Back
          </button>
          <div className="rightHalf halfPageHeight">
            <GameModeSelector
              parentGameMode="Quickplay"
              bonusStyles="leftSideDashedBorder bottomSideDashedBorder"
            />
          </div>
          <div
            style={{ position: "absolute", top: "50%" }}
            className="rightHalf halfPageHeight"
          >
            <GameModeSelector
              parentGameMode="Ranked"
              bonusStyles="leftSideDashedBorder "
            />
          </div>
        </>
      );
  }
}

export default App;

function Login({ validationFormula, OnClick }) {
  let isSubmittable = validationFormula();

  return (
    <button
      className={
        "rightHalf topOption bottomSideDashedBorder leftSideDashedBorder transition" +
        (isSubmittable
          ? " submittable greenTextBorder smooth-16"
          : " notInteractableColor blackTextBorder smooth-16")
      }
      onClick={OnClick}
    >
      Login
    </button>
  );
}

// function CreateAccountLinkPage({ changePage }) {
//   return (
//     <button
//       className="defaultColor fillParent rightHalf hideOverflow leftSideDashedBorder"
//       onClick={() => changePage("CreateAccount")}
//     >
//       Create Account
//     </button>
//   );
// }

//"topOption defaultColor bottomSideDashedBorder leftHalf"
function TopLink({ changePage, text, styles }) {
  return (
    <button className={styles} onClick={changePage}>
      {text}
    </button>
  );
}

function InputField({ value, onChange, title, type, minLength, tabIndex, id }) {
  return (
    <form>
      <input
        // onChange={() =>
        //   console.log(document.getElementById("LoginUserName").value.length)
        // }
        value={value}
        onChange={onChange}
        title={title}
        autoComplete="true"
        type={type}
        size="20"
        minLength={minLength}
        maxLength="20"
        id={id}
        tabIndex={tabIndex}
      ></input>
    </form>
  );
}

function GameModeSelector({ parentGameMode, bonusStyles }) {
  const [pageFlavor, setPageFlavor] = useState("");
  if (pageFlavor == "") {
    return (
      <button
        className={
          "defaultColor fillParent redTextBorder smooth-16 " + bonusStyles
        }
        onClick={() => setPageFlavor("Expanded")}
      >
        {parentGameMode}
      </button>
    );
  }
  if (pageFlavor == "Expanded") {
    return (
      <>
        <button className="defaultColor redTextBorder smooth-16 halfPageHeight fillParent">
          Quickdraw
        </button>
        <div className="fillparent">
          <button
            style={{ width: "50%" }}
            className="defaultColor redTextBorder smooth-16 fillParent"
          >
            TDM
          </button>
          <button
            style={{ width: "50%" }}
            className="defaultColor redTextBorder smooth-16 fillParent"
          >
            S&D
          </button>
        </div>
      </>
    );
  }
}
