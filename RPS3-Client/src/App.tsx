import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, usePresenceData, findSpring } from "motion/react";
import "./styles/texts.css";
import "./styles/styles.css";

import Tile from "./components/Tile";
import MainMenu from "./components/MainMenu";
import LocalMenu from "./components/LocalMenu";
import GamemodeSelect from "./components/GamemodeSelect";
import MatchmakingSelect from "./components/MatchmakingSelect";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import OpponentSearch from "./components/OpponentSearch";
import QuickdrawArena from "./components/QuickdrawArenaDisplay";
import { delay } from "motion";

function App() {
  const [displayState, setDisplayState] = useState("");
  const [nextDisplayState, setNextDisplayState] = useState("Home");
  const previousDisplayState = useRef(displayState);

  useEffect(() => {
    console.log("UseEffect called");
    previousDisplayState.current = displayState;
    console.log("displayState: ", displayState);
    // console.log("previousDisplayState: ", previousDisplayState.current)
  }, [displayState]);

  useEffect(() => {
    console.log("UseEffect called for nextDisplayState");
    setDisplayState(nextDisplayState);
  }, [nextDisplayState]);

  const testingButtons = () => {
    return (
      <>
        <button
          style={{ position: "absolute", marginLeft: "20rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Home")}
        >
          Home
        </button>
        <button
          style={{ position: "absolute", marginLeft: "25rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Local")}
        >
          Local
        </button>
        <button
          style={{ position: "absolute", marginLeft: "30rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Online Gamemodes")}
        >
          Online1
        </button>
        <button
          style={{ position: "absolute", marginLeft: "35rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Online Matchmaking:Quickdraw")}
        >
          Quickdraw
        </button>
        <button
          style={{ position: "absolute", marginLeft: "40rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Online Matchmaking:TDM")}
        >
          TDM
        </button>
        <button
          style={{ position: "absolute", marginLeft: "45rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Online Matchmaking:Search")}
        >
          Search
        </button>

        <button
          style={{ position: "absolute", marginLeft: "50rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Login")}
        >
          Login
        </button>
        <button
          style={{ position: "absolute", marginLeft: "55rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("Create Account")}
        >
          CreateAccount
        </button>
        <button
          style={{ position: "absolute", marginLeft: "60rem", zIndex: "1" }}
          onClick={() => setNextDisplayState("QuickdrawArena")}
        >
          QuickdrawArena
        </button>
        <p style={{ position: "absolute", marginLeft: "20rem", marginTop: "3rem", zIndex: "1" }}>
          {"Prev DisplayState: " + previousDisplayState.current}
        </p>
        <p style={{ position: "absolute", marginLeft: "35rem", marginTop: "3rem", zIndex: "1" }}>
          {"DisplayState: " + displayState}
        </p>
      </>
    );
  };

  const MENU_DISPLAY_STATES = [
    "Home",
    "Local",
    "Online Gamemodes",
    "Online Matchmaking:Quickdraw",
    "Online Matchmaking:TDM",
    "Online Matchmaking:Search",
    "Login",
    "Create Account",
    "Search",
  ];
  const ONLINE_MATCHMAKING_DISPLAY_STATES = [
    "Online Matchmaking:Quickdraw",
    "Online Matchmaking:TDM",
    "Online Matchmaking:Search",
  ];
  const USER_ACCOUNT_DISPLAY_STATES = ["Login", "Create Account"];

  const mainMenuVariants = {
    initial: { y: "1rem", opacity: 0 },
    Home: { x: 0, y: 0, opacity: 1 },
    "Online Gamemodes": { x: "-14rem", y: 0, opacity: 1 },
    "Online Matchmaking": { x: "-25rem", y: 0, opacity: 1 },
    animate: (displayState) => ({
      opacity: 1,
      y: displayState == "Search" ? "-44rem" : 0,
      x:
        displayState == "Home"
          ? 0
          : displayState == "Online Gamemodes" || displayState == "Local"
          ? "-12.5rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState)
          ? "-25rem"
          : USER_ACCOUNT_DISPLAY_STATES.includes(displayState)
          ? "15.4rem"
          : displayState == "Search"
          ? "-25rem"
          : "100vh",
    }),
    exit: { opacity: 0, x: 0, y: 0 },
  };

  const localOrOnlineVariant = {
    localInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == "Online Gamemodes" ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "15.5rem"
          : "30rem",
      y:
        custom.previousDisplayState == "Online Gamemodes" ||
        ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "-30rem"
          : 0,
    }),
    onlineInitial: (custom) => ({
      opacity: 0,
      x: custom.previousDisplayState == "Local" ? "15.5rem" : "30rem",
      y: custom.previousDisplayState == "Local" ? "30rem" : 0,
    }),
    present: () => ({
      opacity: 1,
      x: ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState) || displayState == "Search" ? "3rem" : "15.5rem",
      y: displayState == "Search" ? "-44rem" : 0,
    }),
    localExit: (custom) => ({
      opacity: 0,
      x: custom.nextDisplayState == "Online Gamemodes" ? "15.5rem" : "30rem",
      y: custom.nextDisplayState == "Online Gamemodes" ? "-30rem" : 0,
    }),
    onlineExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == "Local" && ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.displayState)
          ? "3rem"
          : custom.nextDisplayState == "Local"
          ? "15.5rem"
          : "30rem",

      y: custom.nextDisplayState == "Local" ? "30rem" : 0,
    }),
  };

  const onlineMatchmakingVariant = {
    quickdrawInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == "Online Gamemodes"
          ? "55rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "28rem"
          : "100vh",
      y:
        custom.previousDisplayState == "Online Gamemodes"
          ? 0
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "-30rem"
          : "100vh",
    }),
    tdmInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == "Online Gamemodes"
          ? "55rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "28rem"
          : "100vh",
      y:
        custom.previousDisplayState == "Online Gamemodes"
          ? 0
          : custom.previousDisplayState == "Online Matchmaking:Quickdraw"
          ? "30rem"
          : custom.previousDisplayState == "Online Matchmaking:Search"
          ? "-30rem"
          : "100vh",
    }),
    searchInitial: (custom) => ({
      opacity: 0,
      x:
        custom.previousDisplayState == "Online Gamemodes"
          ? "55rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "28rem"
          : "100vh",
      y:
        custom.previousDisplayState == "Online Gamemodes"
          ? 0
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
          ? "30rem"
          : "100vh",
    }),
    present: { y: displayState == "Search" ? "-44rem" : 0, x: "28rem", opacity: 1 },
    quickdrawExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "28rem"
          : "55rem",
      y:
        custom.nextDisplayState == "Local"
          ? "30rem"
          : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "-30rem"
          : 0,
    }),
    tdmExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "28rem"
          : "55rem",
      y:
        custom.nextDisplayState == "Local" || custom.nextDisplayState == "Online Matchmaking:Quickdraw"
          ? "30rem"
          : custom.nextDisplayState == "Online Matchmaking:Search"
          ? "-30rem"
          : 0,
    }),
    searchExit: (custom) => ({
      opacity: 0,
      x:
        custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "28rem"
          : "55rem",
      y:
        custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
          ? "30rem"
          : 0,
    }),
  };

  const thickUserAccountVariant = {
    loginInitial: (custom) => ({
      opacity: 0,
      x: 0,
      y: 0,
    }),
    createAccountInitial: (custom) => ({
      opacity: 0,
      x: 0,
      y: 0,
    }),
    present: { opacity: 1, y: 0, x: 0 },
    loginExit: (custom) => ({
      opacity: 0,
      x: 0,
      y: 0,
    }),
    createAccountExit: (custom) => ({
      opacity: 0,
      x: 0,
      y: 0,
    }),
  };

  const searchVariant = {
    searchInitial: (custom) => ({
      opacity: 0,
      x: 0,
      y: "-20rem",
    }),
    present: { opacity: 1, y: 0, x: 0 },
    searchExit: (custom) => ({
      opacity: 0,
      x: 0,
      y: "-20rem",
    }),
  };

  const slimUserAccountVariant = {
    loginInitial: (custom) => ({
      opacity: 0,
      x: custom.previousDisplayState == "Create Account" ? "-15.5rem" : "-30rem",
      y: custom.previousDisplayState == "Create Account" ? "-30rem" : 0,
    }),
    createAccountInitial: (custom) => ({
      opacity: 0,
      x: custom.previousDisplayState == "Login" ? "-15.5rem" : "-30rem",
      y: custom.previousDisplayState == "Login" ? "30rem" : 0,
    }),
    present: { opacity: 1, y: 0, x: "-15.5rem" },
    loginExit: (custom) => ({
      opacity: 0,
      x: custom.nextDisplayState == "Create Account" ? "-15.5rem" : "-30rem",
      y: custom.nextDisplayState == "Create Account" ? "-30rem" : 0,
    }),
    createAccountExit: (custom) => ({
      opacity: 0,
      x: custom.nextDisplayState == "Login" ? "-15.5rem" : "-30rem",
      y: custom.nextDisplayState == "Login" ? "30rem" : 0,
    }),
  };

  return (
    <>
      {/* {testingButtons()} */}
      {MENU_DISPLAY_STATES.includes(displayState) ? (
        <>
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
            }}
          >
            <AnimatePresence mode="popLayout">
              {displayState == "Login" ? (
                <motion.div
                  key="Login"
                  initial="loginInitial"
                  animate="present"
                  exit="loginExit"
                  variants={slimUserAccountVariant}
                  custom={{
                    nextDisplayState: nextDisplayState,
                    displayState: displayState,
                    previousDisplayState: previousDisplayState.current,
                  }}
                  // className={"tile slim pink"}
                >
                  <Login displayState={displayState} setDisplayState={setNextDisplayState} />
                </motion.div>
              ) : null}
              {displayState == "Create Account" ? (
                <motion.div
                  key="Create Account"
                  initial="createAccountInitial"
                  animate="present"
                  exit="createAccountExit"
                  variants={slimUserAccountVariant}
                  custom={{
                    nextDisplayState: nextDisplayState,
                    displayState: displayState,
                    previousDisplayState: previousDisplayState.current,
                  }}
                  // className={"tile slim cyan"}
                >
                  <CreateAccount displayState={displayState} setDisplayState={setNextDisplayState} />
                </motion.div>
              ) : null}
              {/* {displayState !== "Login" && displayState !== "Create Account" ? ( */}
              <motion.div
                key="MainMenu"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={mainMenuVariants}
                custom={displayState}
                // className={"tile thick green"}
                style={{ position: "absolute", zIndex: "1" }}
              >
                <MainMenu displayState={displayState} setDisplayState={setNextDisplayState} />
              </motion.div>
              {/*}) : null */}
              {displayState == "Local" ? (
                <motion.div
                  key="Local"
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
                  <LocalMenu displayState={displayState} setDisplayState={setNextDisplayState} />
                </motion.div>
              ) : null}
              {displayState == "Online Gamemodes" ||
              displayState == "Search" ||
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
              {displayState == "Online Matchmaking:Quickdraw" ||
              (previousDisplayState.current == "Online Matchmaking:Quickdraw" && displayState == "Search") ? (
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
                    gamemode={"Quickdraw"}
                    displayState={displayState}
                    setDisplayState={setNextDisplayState}
                  />
                </motion.div>
              ) : null}
              {displayState == "Online Matchmaking:TDM" ||
              (previousDisplayState.current == "Online Matchmaking:TDM" && displayState == "Search") ? (
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
                  />
                </motion.div>
              ) : null}
              {displayState == "Online Matchmaking:Search" ||
              (previousDisplayState.current == "Online Matchmaking:Search" && displayState == "Search") ? (
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
                    gamemode={"Search"}
                    displayState={displayState}
                    setDisplayState={setNextDisplayState}
                  />
                </motion.div>
              ) : null}
              {displayState == "Search" ? (
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
                  <OpponentSearch displayState={displayState} setDisplayState={setNextDisplayState} />
                </motion.div>
              ) : null}
              //add remaining matchmaking tiles
            </AnimatePresence>
          </div>
        </>
      ) : null}
      {displayState == "QuickdrawArena" ? <QuickdrawArena setDisplayState={setNextDisplayState} /> : null}
    </>
  );
}

export default App;

const variants = {
  present: {
    x: "0rem",
    y: "0rem",
    opacity: 1,
  },
  up: (num, isVisible) => {
    return {
      y: `-${num}rem`,
      opacity: isVisible ? 1 : 0,
    };
  },
  down: (num, isVisible) => {
    return {
      y: `${num}rem`,
      opacity: isVisible ? 1 : 0,
    };
  },
  left: (num, isVisible) => {
    return {
      x: `-${num}rem`,
      opacity: isVisible ? 1 : 0,
    };
  },
  right: (num, isVisible) => {
    return {
      x: `${num}rem`,
      opacity: isVisible ? 1 : 0,
    };
  },
};
