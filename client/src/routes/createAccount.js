import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import LoginButton from "../components/LoginButton";
import LoginInputButton from "../components/LoginInputButton";

import apiRoutes from "../apiRoutes";
import pages from "../enums/pages";
import { attemptLogin } from "../helper";

import { useState } from "react";

function CreateAccount({
  navigate,
  accessTokenHook,
  refreshTokenHook,
  userInfoHook,
}) {
  const [createAccountUsername, setCreateAccountUsername] = useState("");
  const [createAccountInitialPassword, setCreateAccountInitialPassword] =
    useState("");
  const [createAccountConfirmPassword, setCreateAccountConfirmPassword] =
    useState("");

  const userCredentials = {
    username: createAccountUsername,
    password: createAccountConfirmPassword,
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
            //send user back and clear input fields
            setCreateAccountUsername("");
            setCreateAccountInitialPassword("");
            setCreateAccountConfirmPassword("");
            navigate(`/${pages.INITIAL}`);
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
            let minLengthSatisfied = dependencies.every((x) => {
              return x.value.length >= x.minLength;
            });
            let passwordsMatch =
              dependencies[1].value === dependencies[2].value;
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
              // setCreateAccountUsername("");
              // setCreateAccountInitialPassword("");
              // setCreateAccountConfirmPassword("");
              await attemptLogin(
                navigate,
                userCredentials,
                accessTokenHook,
                refreshTokenHook,
                userInfoHook
              );
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
}

export default CreateAccount;
