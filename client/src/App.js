import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./styles/buttonStyles.css";
import "./styles/texts.css";
import "./styles/elementSpecific.css";

import pages from "./enums/pages";
import apiRoutes from "./apiRoutes";

import Root from "./routes/root.js";
import Login from "./routes/login";
import CreateAccount from "./routes/createAccount";

import MainMenu from "./routes/mainMenu.js";
import Online from "./routes/online";
import Account from "./routes/account";

function App() {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const tokens = {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
  const [userInfo, setUserInfo] = useState({
    username: "",
    userId: "",
    emoji: "",
  });

  const loginHelper = async (credentials) => {
    //authorizes user and returns access tokens and user account info
    let res = await fetch(apiRoutes.login, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(credentials),
    });
    let body = await res.json();
    console.log(body);
    // return body;
    setAccessToken(body.accessToken);
    setRefreshToken(body.refreshToken);
    setUserInfo({
      //this could be sent in the body of the JWT for style points
      username: body.user.username,
      userId: body.user.userId,
      emoji: body.user.emoji,
    });
    navigate(`/${pages.MAIN_MENU}`);
  };

  return (
    <Routes>
      <Route
        path={`/${pages.INITIAL}`}
        element={<Root navigate={navigate} />}
      />
      <Route
        path={`/${pages.LOGIN}`}
        element={<Login navigate={navigate} login={loginHelper} />}
      />
      <Route
        path={`/${pages.CREATE_ACCOUNT}`}
        element={<CreateAccount navigate={navigate} login={loginHelper} />}
      />
      <Route
        path={`/${pages.MAIN_MENU}`}
        element={
          <MainMenu
            navigate={navigate}
            userInfo={userInfo}
            accessTokenHook={setAccessToken}
            refreshTokenHook={setRefreshToken}
          />
        }
      />
      <Route
        path={`/${pages.ACCOUNT}`}
        element={<Account navigate={navigate} userInfo={userInfo} />}
      />
      <Route
        path={`/${pages.ONLINE.INITIAL}`}
        element={<Online navigate={navigate} />}
      />
    </Routes>
  );
}

export default App;
