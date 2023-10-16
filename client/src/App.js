import { useState, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./styles/buttonStyles.css";
import "./styles/texts.css";
import "./styles/elementSpecific.css";

import PAGES from "./enums/pages";
import API_ROUTES from "./enums/apiRoutes";
import { getNewAccessToken } from "./helper";

import Root from "./routes/root.js";
import Login from "./routes/login";
import CreateAccount from "./routes/createAccount";

import MainMenu from "./routes/mainMenu.js";
import Online from "./routes/online";
import Account from "./routes/account";
import QuickdrawArena from "./routes/quickdrawArena";

function App() {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const [userInfo, setUserInfo] = useState({
    username: "",
    userId: "",
    emoji: "",
  });

  const [currentGameInfo, setCurrentGameInfo] = useState("");

  const loginHelper = async (credentials) => {
    //authorizes user and returns access tokens and user account info
    let res = await fetch(API_ROUTES.LOGIN, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.status == 200) {
      let body = await res.json();
      //console.log(body);
      // return body;
      setAccessToken(body.accessToken);
      setRefreshToken(body.refreshToken);
      setUserInfo({
        //this could be sent in the body of the JWT for style points
        username: body.user.username,
        userId: body.user.userId,
        emoji: body.user.emoji,
      });
      navigate(`/${PAGES.MAIN_MENU}`);
    } else {
      let body = await res.text();
      console.log(body);
    }
  };

  const authorizeThenCall = useCallback(
    async (url, requestType, body) => {
      // console.log("From AuthThenCall");
      // console.log("accessToken");
      // console.log(accessToken);
      // console.log("refreshToken");
      // console.log(refreshToken);
      // console.log("");
      try {
        if (accessToken == "")
          throw new Error("No AccessToken to authorize against");

        let res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
          method: requestType,
          body: JSON.stringify(body),
        });

        if (res.status == 403) {
          //refresh Token
          const newAccessToken = await getNewAccessToken(refreshToken);
          setAccessToken(newAccessToken);

          res = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + newAccessToken,
            },
            method: requestType,
            body: JSON.stringify(body),
          });

          if (res.status == 403) {
            throw new Error("Refresh Token invalid");
          }
        }
        if (res.status == 200) return res;
      } catch (error) {
        console.error("Error authorizing call to:" + url);
        console.error(error);
        throw new Error(error); // to make the promise get rejected
      }
    },
    [accessToken, refreshToken]
  );

  return (
    <Routes>
      <Route
        path={`/${PAGES.INITIAL}`}
        element={<Root navigate={navigate} />}
      />
      <Route
        path={`/${PAGES.LOGIN}`}
        element={<Login navigate={navigate} login={loginHelper} />}
      />
      <Route
        path={`/${PAGES.CREATE_ACCOUNT}`}
        element={<CreateAccount navigate={navigate} login={loginHelper} />}
      />
      <Route
        path={`/${PAGES.MAIN_MENU}`}
        element={
          <MainMenu
            navigate={navigate}
            userInfo={userInfo}
            onLogout={() => {
              authorizeThenCall(API_ROUTES.LOGOUT, "DELETE", {
                refreshToken: refreshToken,
              });

              setAccessToken("");
              setRefreshToken("");
              navigate(`/${PAGES.INITIAL}`);
            }}
          />
        }
      />
      <Route
        path={`/${PAGES.ACCOUNT}`}
        element={
          <Account
            navigate={navigate}
            userInfo={userInfo}
            authHelper={authorizeThenCall}
          />
        }
      />
      <Route
        path={`/${PAGES.ONLINE.INITIAL}`}
        element={
          <Online
            navigate={navigate}
            userId={userInfo.userId}
            authHelper={authorizeThenCall}
            gameInfoSetter={setCurrentGameInfo}
          />
        }
      />
      <Route
        path={`/${PAGES.ONLINE.QUICKDRAW_ARENA}`}
        element={
          <QuickdrawArena
            authHelper={authorizeThenCall}
            navigate={navigate}
            userInfo={userInfo}
            gameInfo={currentGameInfo}
            gameInfoSetter={setCurrentGameInfo}
          />
        }
      />
    </Routes>
  );
}

export default App;
