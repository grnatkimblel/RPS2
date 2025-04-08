import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
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

function App() {
  const [displayState, setDisplayState] = useState("Initial");
  const currentDisplayState = useRef(displayState);
  const previousDisplayState = useRef<string | null>(null);

  useEffect(() => {
    previousDisplayState.current = currentDisplayState.current;
    currentDisplayState.current = displayState;
  }, [displayState]);

  const testingButtons = () => {
    return (
      <>
        <div style={{ position: "absolute", marginLeft: "2rem" }} className="RPS-Title">
          RPS
        </div>
        <button style={{ position: "absolute", marginLeft: "20rem" }} onClick={() => setDisplayState("Initial")}>
          Initial
        </button>
        <button style={{ position: "absolute", marginLeft: "25rem" }} onClick={() => setDisplayState("Local")}>
          Local
        </button>
        <button style={{ position: "absolute", marginLeft: "30rem" }} onClick={() => setDisplayState("Online1")}>
          Online1
        </button>
        <button style={{ position: "absolute", marginLeft: "35rem" }} onClick={() => setDisplayState("Online2")}>
          Online2
        </button>

        <button style={{ position: "absolute", marginLeft: "40rem" }} onClick={() => setDisplayState("Login")}>
          Login
        </button>
        <button style={{ position: "absolute", marginLeft: "45rem" }} onClick={() => setDisplayState("CreateAccount")}>
          CreateAccount
        </button>
      </>
    );
  };

  const variants = {
    enter: {
      up: {
        y: "10rem",
        opacity: 0,
      },
      down: {
        y: "-10rem",
        opacity: 0,
      },
      left: {
        x: "-10rem",
        opacity: 0,
      },
      right: {
        x: "10rem",
        opacity: 0,
      },
    },
    exit: {
      up: {
        y: "10rem",
        opacity: 0,
      },
      down: {
        y: "-10rem",
        opacity: 0,
      },
      left: {
        x: "-10rem",
        opacity: 0,
      },
      right: {
        x: "10rem",
        opacity: 0,
      },
    },
  };

  const renderConditionaAuthContent = () => {
    switch (displayState) {
      case "Login":
        return <div className="tile slim blue" onClick={() => setDisplayState("CreateAccount")}></div>;
      case "CreateAccount":
        return <div className="tile slim cyan" onClick={() => setDisplayState("Login")}></div>;
    }
  };

  const renderConditionalGameContent = () => {
    switch (displayState) {
      case "Local":
        return (
          <motion.div key="LocalMenu" layout="position" layoutId="GameMenu" className="tile slim red"></motion.div>
        );
      case "Online1":
        return (
          <motion.div key="OnlineMenu" layout="position" layoutId="GameMenu" className="purple">
            <div className="tile slim yellow" onClick={() => setDisplayState("Online2")}></div>
          </motion.div>
        );
      case "Online2":
        return (
          <motion.div key="OnlineMenu" layout="position" layoutId="GameMenu" className="purple">
            <div className="tile slim yellow" onClick={() => setDisplayState("Online1")}></div>
            <div className="tile slim orange" onClick={() => setDisplayState("Online3")}></div>
          </motion.div>
        );
    }
  };

  return (
    <>
      {testingButtons()}
      <motion.div
        // layout
        // transition={{ layout: { type: "spring", stiffness: 50, damping: 20, duration: 1 } }}
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2vw",
          backgroundColor: "white",
        }}
      >
        <AnimatePresence mode="popLayout">{renderConditionaAuthContent()}</AnimatePresence>
        <motion.div
          layout
          initial={{ y: "10rem", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="tile thick green"
          onClick={() => setDisplayState("Initial")}
        ></motion.div>
        <AnimatePresence mode="popLayout">{renderConditionalGameContent()}</AnimatePresence>
      </motion.div>
    </>
  );
}

export default App;
