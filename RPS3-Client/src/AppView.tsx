import { motion, AnimatePresence } from "motion/react";
import "./styles/texts.css";
import "./styles/styles.css";

import DisplayStates from "./enums/DisplayStates.ts";

import GameInfo from "./types/QuickdrawSessionData.ts";
import GameType from "./enums/GameType.ts";
import PlayerInfo from "./types/PlayerModel.ts";

import MainMenu from "./components/MainMenu/index.jsx";
import LocalMenu from "./components/LocalMenu/index.jsx";
import GamemodeSelect from "./components/GamemodeSelect/index.jsx";
import MatchmakingSelect from "./components/MatchmakingSelect/index.jsx";
import Login from "./components/Login/index.jsx";
import CreateAccount from "./components/CreateAccount/index.jsx";
import Account from "./components/Account/index.jsx";
import OpponentSearch from "./components/OpponentSearch/index.jsx";
import QuickdrawInfoGraphic from "./components/QuickdrawInfoGraphic/index";
import QuickdrawArenaControllerLocal from "./components/QuickdrawArenaControllerLocal/index";
import QuickdrawArenaControllerOnline from "./components/QuickdrawArenaControllerOnline/index";
import Settings from "./components/Settings/index";
import { userInfo } from "os";

function AppView({
  //displayState stuff
  previousDisplayState,
  displayState,
  nextDisplayState,
  setNextDisplayState,
  //auth stuff
  setAccessToken,
  setRefreshToken,
  refreshToken,
  loginHelper,
  authorizeThenCallHttp,
  userInfo,
  setUserInfo,
  //local stuff
  localPlayer1Name,
  localPlayer2Name,
  setLocalPlayer1Name,
  setLocalPlayer2Name,
  //online stuff
  currentGameInfo,
  setCurrentGameInfo,
  matchmakingPreferences,
  setMatchmakingPreferences,
  //settings stuff
  soundVolume,
  setSoundVolume,
}) {
  const MENU_DISPLAY_STATES = [
    DisplayStates.Home,
    DisplayStates.Local,
    DisplayStates.Online_Gamemodes,
    DisplayStates.Online_Matchmaking_Quickdraw,
    DisplayStates.Online_Matchmaking_TDM,
    DisplayStates.Online_Matchmaking_Search,
    DisplayStates.Login,
    DisplayStates.Create_Account,
    DisplayStates.Account,
    DisplayStates.Search,
    DisplayStates.Settings,
  ];
  const ONLINE_MATCHMAKING_DISPLAY_STATES = [
    DisplayStates.Online_Matchmaking_Quickdraw,
    DisplayStates.Online_Matchmaking_TDM,
    DisplayStates.Online_Matchmaking_Search,
  ];
  const USER_ACCOUNT_DISPLAY_STATES = [DisplayStates.Login, DisplayStates.Create_Account, DisplayStates.Account];

  const mainMenuVariants = {
    initial: { y: "1rem", opacity: 0 },
    [DisplayStates.Home]: { x: 0, y: 0, opacity: 1 },
    [DisplayStates.Online_Gamemodes]: { x: "-14rem", y: 0, opacity: 1 },
    // "Online Matchmaking": { x: "-25rem", y: 0, opacity: 1 },
    animate: (displayState) => ({
      opacity: 1,
      y: displayState == DisplayStates.Search || displayState == DisplayStates.Settings ? "-44rem" : 0,
      x:
        displayState == DisplayStates.Home || displayState == DisplayStates.Settings
          ? 0
          : displayState == DisplayStates.Online_Gamemodes || displayState == DisplayStates.Local
          ? "-12.5rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState)
          ? "-25rem"
          : USER_ACCOUNT_DISPLAY_STATES.includes(displayState)
          ? "15.4rem"
          : displayState == DisplayStates.Search
          ? "-25rem"
          : "100vh",
    }),
    exit: { opacity: 0, x: 0, y: 0 },
  };
  const localOrOnlineVariant = {
    localInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "15.5rem"
          : "30rem",
      y:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "-30rem"
          : 0,
    }),
    onlineInitial: (custom) => ({
      opacity: 0,
      x: custom.previousDisplayState == DisplayStates.Local ? "15.5rem" : "30rem",
      y: custom.previousDisplayState == DisplayStates.Local ? "30rem" : 0,
    }),
    present: () => ({
      opacity: 1,
      x:
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState) || displayState == DisplayStates.Search
          ? "3rem"
          : "15.5rem",
      y: displayState == DisplayStates.Search ? "-44rem" : 0,
    }),
    localExit: (custom) => ({
      opacity: 0,
      x: custom.nextDisplayState == DisplayStates.Online_Gamemodes ? "15.5rem" : "30rem",
      y: custom.nextDisplayState == DisplayStates.Online_Gamemodes ? "-30rem" : 0,
    }),
    onlineExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == DisplayStates.Local &&
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.displayState)
          ? "3rem"
          : custom.nextDisplayState == DisplayStates.Local
          ? "15.5rem"
          : "30rem",

      y: custom.nextDisplayState == DisplayStates.Local ? "30rem" : 0,
    }),
  };

  const onlineMatchmakingVariant = {
    quickdrawInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes
          ? "55rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "28rem"
          : "100vh",
      y:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes
          ? 0
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "-30rem"
          : "100vh",
    }),
    tdmInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes
          ? "55rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "28rem"
          : "100vh",
      y:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes
          ? 0
          : custom.previousDisplayState == DisplayStates.Online_Matchmaking_Quickdraw
          ? "30rem"
          : custom.previousDisplayState == DisplayStates.Online_Matchmaking_Search
          ? "-30rem"
          : "100vh",
    }),
    searchInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes
          ? "55rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "28rem"
          : "100vh",
      y:
        custom.previousDisplayState == DisplayStates.Online_Gamemodes
          ? 0
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "30rem"
          : "100vh",
    }),
    present: { y: displayState == DisplayStates.Search ? "-44rem" : 0, x: "28rem", opacity: 1 },
    quickdrawExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == DisplayStates.Local ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "28rem"
          : "55rem",
      y:
        custom.nextDisplayState == DisplayStates.Local
          ? "30rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "-30rem"
          : 0,
    }),
    tdmExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == DisplayStates.Local ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "28rem"
          : "55rem",
      y:
        custom.nextDisplayState == DisplayStates.Local ||
        custom.nextDisplayState == DisplayStates.Online_Matchmaking_Quickdraw
          ? "30rem"
          : custom.nextDisplayState == DisplayStates.Online_Matchmaking_Search
          ? "-30rem"
          : 0,
    }),
    searchExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == DisplayStates.Local ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "28rem"
          : "55rem",
      y:
        custom.nextDisplayState == DisplayStates.Local ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "30rem"
          : 0,
    }),
  };

  const searchVariant = {
    searchInitial: (custom) => ({
      opacity: 0,
      x: 0,
      y: "20rem",
    }),
    present: { opacity: 1, y: 0, x: 0 },
    searchExit: (custom) => ({
      opacity: 0,
      x: 0,
      y: "20rem",
    }),
  };

  const userAccountVariant = {
    loginInitial: (custom) => ({
      opacity: 0,
      x: custom.previousDisplayState == DisplayStates.Create_Account ? "-15.5rem" : "-30rem",
      y: custom.previousDisplayState == DisplayStates.Create_Account ? "-30rem" : 0,
    }),
    createAccountInitial: (custom) => ({
      opacity: 0,
      x: custom.previousDisplayState == DisplayStates.Login ? "-15.5rem" : "-30rem",
      y: custom.previousDisplayState == DisplayStates.Login ? "30rem" : 0,
    }),
    present: { opacity: 1, y: 0, x: "-15.5rem" },
    loginExit: (custom) => ({
      opacity: 0,
      x: custom.nextDisplayState == DisplayStates.Create_Account ? "-15.5rem" : "-30rem",
      y: custom.nextDisplayState == DisplayStates.Create_Account ? "-30rem" : 0,
    }),
    createAccountExit: (custom) => ({
      opacity: 0,
      x: custom.nextDisplayState == DisplayStates.Login ? "-15.5rem" : "-30rem",
      y: custom.nextDisplayState == DisplayStates.Login ? "30rem" : 0,
    }),
    accountInitial: { opacity: 0, x: "-30rem" },
    accountExit: { opacity: 0, x: "-30rem" },
  };

  const fullScreenRightToLeftVariant = {
    initial: {
      opacity: 0,
      x: "100vw",
      y: 0,
    },
    animate: { opacity: 1, x: 0, y: 0, transition: { type: "spring", bounce: 0.25, duration: 1 } },
    exit: { opacity: 0, x: "-100vw", y: 0, transition: { type: "spring", bounce: 0.25, duration: 1 } },
  };

  return (
    <>
      {/* {testingButtons()} */}
      <AnimatePresence mode="popLayout">
        {MENU_DISPLAY_STATES.includes(displayState) ? (
          <motion.div
            key="EntireHomeDisplay"
            initial={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: "-100vw", y: 0, transition: { type: "spring", bounce: 0.25, duration: 1 } }}
          >
            <div style={{ position: "absolute", marginLeft: "2rem", zIndex: "2" }} className="RPS-Title">
              RPS
            </div>
            <div
              style={{
                display: "flex",
                height: "100vh",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                // backgroundColor: "var(--backgroundColor)",
              }}
            >
              <AnimatePresence mode="popLayout">
                {displayState == DisplayStates.Login ? (
                  <motion.div
                    key={DisplayStates.Login}
                    initial="loginInitial"
                    animate="present"
                    exit="loginExit"
                    variants={userAccountVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim pink"}
                  >
                    <Login
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      loginHelper={loginHelper}
                    />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Create_Account ? (
                  <motion.div
                    key={DisplayStates.Create_Account}
                    initial="createAccountInitial"
                    animate="present"
                    exit="createAccountExit"
                    variants={userAccountVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim cyan"}
                  >
                    <CreateAccount
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      authorizeThenCallHttp={authorizeThenCallHttp}
                      loginHelper={loginHelper}
                    />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Account ? (
                  <motion.div
                    key={DisplayStates.Account}
                    initial="accountInitial"
                    animate="present"
                    exit="accountExit"
                    variants={userAccountVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim cyan"}
                  >
                    <Account
                      // displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      authorizeThenCallHttp={authorizeThenCallHttp}
                      refreshToken={refreshToken}
                      setAccessToken={setAccessToken}
                      setRefreshToken={setRefreshToken}
                      userInfo={userInfo}
                      setUserInfo={setUserInfo}
                      // loginHelper={loginHelper}
                    />
                  </motion.div>
                ) : null}
                {/* {displayState !== DisplayStates.Login && displayState !== DisplayStates.Create_Account ? ( */}
                <motion.div
                  key={DisplayStates.Home}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={mainMenuVariants}
                  custom={displayState}
                  // className={"tile thick green"}
                  style={{ position: "absolute", zIndex: "1" }}
                >
                  <MainMenu displayState={displayState} setDisplayState={setNextDisplayState} userInfo={userInfo} />
                </motion.div>
                {/*}) : null */}
                {displayState == DisplayStates.Local ? (
                  <motion.div
                    key={DisplayStates.Local}
                    initial="localInitial"
                    animate="present"
                    exit="localExit"
                    variants={localOrOnlineVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim yellow"}
                    style={{ position: "absolute" }}
                  >
                    <LocalMenu
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      setLocalPlayer1Name={setLocalPlayer1Name}
                      setLocalPlayer2Name={setLocalPlayer2Name}
                    />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Online_Gamemodes ||
                displayState == DisplayStates.Search ||
                ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState) ? (
                  <motion.div
                    key="Online"
                    initial="onlineInitial"
                    animate="present"
                    exit="onlineExit"
                    variants={localOrOnlineVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim blue"}
                    style={{ position: "absolute" }}
                  >
                    <GamemodeSelect displayState={displayState} setDisplayState={setNextDisplayState} />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Online_Matchmaking_Quickdraw ||
                (previousDisplayState.current == DisplayStates.Online_Matchmaking_Quickdraw &&
                  displayState == DisplayStates.Search) ? (
                  <motion.div
                    key="Matchmaking:Quickdraw"
                    initial="quickdrawInitial"
                    animate="present"
                    exit="quickdrawExit"
                    variants={onlineMatchmakingVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim red"}
                    style={{ position: "absolute" }}
                  >
                    <MatchmakingSelect
                      userInfo={userInfo}
                      gamemode={"Quickdraw"}
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      authorizeThenCallHttp={authorizeThenCallHttp}
                      gameInfoSetter={setCurrentGameInfo}
                      setMatchmakingPreferences={setMatchmakingPreferences}
                    />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Online_Matchmaking_TDM ||
                (previousDisplayState.current == DisplayStates.Online_Matchmaking_TDM &&
                  displayState == DisplayStates.Search) ? (
                  <motion.div
                    key="Matchmaking:TDM"
                    initial="tdmInitial"
                    animate="present"
                    exit="tdmExit"
                    variants={onlineMatchmakingVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim orange"}
                    style={{ position: "absolute" }}
                  >
                    <MatchmakingSelect
                      gamemode={"TDM"}
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      gameInfoSetter={setCurrentGameInfo}
                      setMatchmakingPreferences={setMatchmakingPreferences}
                    />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Online_Matchmaking_Search ||
                (previousDisplayState.current == DisplayStates.Online_Matchmaking_Search &&
                  displayState == DisplayStates.Search) ? (
                  <motion.div
                    key="Matchmaking:Search"
                    initial="searchInitial"
                    animate="present"
                    exit="searchExit"
                    variants={onlineMatchmakingVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim purple"}
                    style={{ position: "absolute" }}
                  >
                    <MatchmakingSelect
                      gamemode={"S&D"}
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      gameInfoSetter={setCurrentGameInfo}
                      setMatchmakingPreferences={setMatchmakingPreferences}
                    />
                  </motion.div>
                ) : null}
                {displayState == DisplayStates.Search ? (
                  <motion.div
                    key="OpponentSearch"
                    initial="searchInitial"
                    animate="present"
                    exit="searchExit"
                    variants={searchVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim purple"}
                    style={{ position: "absolute" }}
                  >
                    <OpponentSearch
                      // displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      authorizeThenCallHttp={authorizeThenCallHttp}
                      matchmakingPreferences={matchmakingPreferences}
                      userInfo={userInfo}
                      setCurrentGameInfo={setCurrentGameInfo}
                    />
                  </motion.div>
                ) : null}
                //add remaining matchmaking tiles
                {displayState == DisplayStates.Settings ? (
                  <motion.div
                    key={DisplayStates.Settings}
                    initial="searchInitial"
                    animate="present"
                    exit="searchExit"
                    variants={searchVariant}
                    custom={{
                      nextDisplayState: nextDisplayState,
                      displayState: displayState,
                      previousDisplayState: previousDisplayState.current,
                    }}
                    // className={"tile slim purple"}
                    style={{ position: "absolute" }}
                  >
                    <Settings
                      displayState={displayState}
                      setDisplayState={setNextDisplayState}
                      soundVolume={soundVolume}
                      setSoundVolume={setSoundVolume}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : displayState == DisplayStates.Quickdraw_InfoGraphic ? (
          <QuickdrawInfoGraphic displayVariant={fullScreenRightToLeftVariant} setDisplayState={setNextDisplayState} />
        ) : displayState == DisplayStates.Quickdraw_Arena_Local ? (
          <QuickdrawArenaControllerLocal
            setDisplayState={setNextDisplayState}
            displayVariant={fullScreenRightToLeftVariant}
            quickdrawSessionData={{
              sessionId: "1234",
              gameStartTime: 1234,
              gameType: GameType.QUICKPLAY,
              player1: { username: localPlayer1Name, userId: "1234", emoji: "" },
              player2: { username: localPlayer2Name, userId: "5678", emoji: "" },
            }}
            soundVolume={soundVolume}
          />
        ) : displayState == DisplayStates.Quickdraw_Arena_Online ? (
          <QuickdrawArenaControllerOnline
            setDisplayState={setNextDisplayState}
            quickdrawSessionData={currentGameInfo}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default AppView;
