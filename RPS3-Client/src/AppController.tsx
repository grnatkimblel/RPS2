import { useState, useRef, useEffect, useCallback } from "react";

import AppView from "./AppView";

import DisplayStates from "./enums/DisplayStates";
import API_ROUTES from "./enums/API_Routes";

function AppController() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const [userInfo, setUserInfo] = useState({
    username: "",
    userId: "",
    emoji: "",
  });

  const [matchmakingPreferences, setMatchmakingPreferences] = useState({
    gameMode: "",
    gameType: "",
  });
  const [currentGameInfo, setCurrentGameInfo] = useState("");

  const [soundVolume, setSoundVolume] = useState(() => {
    const savedValue = localStorage.getItem("soundVolume");
    // console.log("Sound volume loaded from local storage: ", savedValue);
    // console.log("Sound volume loaded from local storage: ", typeof savedValue);
    return savedValue !== null && savedValue !== "undefined" && savedValue !== "NaN" ? parseFloat(savedValue) : 0.1;
  });

  const [displayState, setDisplayState] = useState<DisplayStates>(DisplayStates.Home);
  const [nextDisplayState, setNextDisplayState] = useState<DisplayStates>(DisplayStates.Home);
  const previousDisplayState = useRef(displayState);

  const [localPlayer1Name, setLocalPlayer1Name] = useState("");
  const [localPlayer2Name, setLocalPlayer2Name] = useState("");

  const loginHelper = async (credentials) => {
    //authorizes user and returns access tokens and user account info
    // console.log(process.env.REACT_APP_HOST_URL);
    let res = await fetch(API_ROUTES.LOGIN, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.status === 200) {
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
      setNextDisplayState(DisplayStates.Home);
    } else {
      let body = await res.text();
      console.log(body);
      alert("Login failed. \nCheck your username and password and try again.");
    }
  };

  const authorizeThenCallHttp = useCallback(
    async (url, requestType, body) => {
      try {
        if (accessToken === "") throw new Error("No AccessToken to authorize against");

        let res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
          method: requestType,
          body: JSON.stringify(body),
        });

        if (res.status === 403) {
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

          if (res.status === 403) {
            throw new Error("Refresh Token invalid");
          }
        }
        if (res.status === 200) return res;
      } catch (error) {
        console.error("Error authorizing call to:" + url);
        console.error(error);
        throw new Error(error); // to make the promise get rejected
      }
    },
    [accessToken, refreshToken]
  );

  useEffect(() => {
    async function autoLogIn() {
      const userCredentialsString = localStorage.getItem("lastUserCredentials");
      console.log(userCredentialsString);
      const userCredentials = JSON.parse(userCredentialsString);
      if (userCredentials) {
        if (!userInfo.userId) {
          await loginHelper(userCredentials);
        }
      }
    }
    autoLogIn();

    return () => {
      if (userInfo.userId) {
        authorizeThenCallHttp(API_ROUTES.LOGOUT, "DELETE", {
          refreshToken: refreshToken,
        });
        setAccessToken("");
        setRefreshToken("");
      }
    };
  }, []);

  useEffect(() => {
    // Save the sound volume to local storage whenever it changes
    localStorage.setItem("soundVolume", soundVolume.toString());
    return () => {
      // Cleanup function to remove the sound volume from local storage if needed
      // localStorage.clear();
    };
  }, [soundVolume]);

  // console.log(displayState);
  useEffect(() => {
    // console.log("UseEffect called");
    previousDisplayState.current = displayState;
    // console.log("displayState: ", displayState);
    // console.log("previousDisplayState: ", previousDisplayState.current)
  }, [displayState]);

  useEffect(() => {
    // console.log("UseEffect called for nextDisplayState");
    setDisplayState(nextDisplayState);
  }, [nextDisplayState]);

  //just for testing
  useEffect(() => {
    // console.log(currentGameInfo);
    // console.log("recentPlayers", localStorage.getItem("recentPlayers"));
  }, [currentGameInfo]);

  return (
    <AppView
      //displayState stuff
      previousDisplayState={previousDisplayState}
      displayState={displayState}
      nextDisplayState={nextDisplayState}
      setNextDisplayState={setNextDisplayState}
      //auth stuff
      setAccessToken={setAccessToken}
      setRefreshToken={setRefreshToken}
      refreshToken={refreshToken}
      loginHelper={loginHelper}
      authorizeThenCallHttp={authorizeThenCallHttp}
      userInfo={userInfo}
      setUserInfo={setUserInfo}
      //local stuff
      localPlayer1Name={localPlayer1Name}
      localPlayer2Name={localPlayer2Name}
      setLocalPlayer1Name={setLocalPlayer1Name}
      setLocalPlayer2Name={setLocalPlayer2Name}
      //online stuff
      currentGameInfo={currentGameInfo}
      setCurrentGameInfo={setCurrentGameInfo}
      matchmakingPreferences={matchmakingPreferences}
      setMatchmakingPreferences={setMatchmakingPreferences}
      //settings stuff
      soundVolume={soundVolume}
      setSoundVolume={setSoundVolume}
    />
  );
}

export default AppController;
