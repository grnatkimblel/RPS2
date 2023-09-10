import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./styles/buttonStyles.css";
import "./styles/texts.css";
import "./styles/elementSpecific.css";

import pages from "./enums/pages";

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
  });

  return (
    <Routes>
      <Route
        path={`/${pages.INITIAL}`}
        element={<Root navigate={navigate} />}
      />
      <Route
        path={`/${pages.LOGIN}`}
        element={
          <Login
            navigate={navigate}
            accessTokenHook={setAccessToken}
            refreshTokenHook={setRefreshToken}
            userInfoHook={setUserInfo}
          />
        }
      />
      <Route
        path={`/${pages.CREATE_ACCOUNT}`}
        element={
          <CreateAccount
            navigate={navigate}
            accessTokenHook={setAccessToken}
            refreshTokenHook={setRefreshToken}
            userInfoHook={setUserInfo}
          />
        }
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
