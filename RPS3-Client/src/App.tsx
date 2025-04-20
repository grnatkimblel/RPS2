import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup , usePresenceData} from "motion/react";
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
  const [displayState, setDisplayState] = useState("");
  const [nextDisplayState, setNextDisplayState] = useState("Home");
  const previousDisplayState = useRef(displayState);
  
  useEffect(() => {
    console.log("UseEffect called")
    previousDisplayState.current = displayState;
    console.log("displayState: ", displayState)
    // console.log("previousDisplayState: ", previousDisplayState.current)
  }, [displayState]);

  useEffect( () => {
    setDisplayState(nextDisplayState)
  }, [nextDisplayState])
  
  const testingButtons = () => {
    return (
      <>
        <div style={{ position: "absolute", marginLeft: "2rem", zIndex: "1" }} className="RPS-Title">
          RPS
        </div>
        <button style={{ position: "absolute", marginLeft: "20rem", zIndex: "1" }} onClick={() => setNextDisplayState("Home")}>
          Home
        </button>
        <button style={{ position: "absolute", marginLeft: "25rem", zIndex: "1" }} onClick={() => setNextDisplayState("Local")}>
          Local
        </button>
        <button style={{ position: "absolute", marginLeft: "30rem", zIndex: "1" }} onClick={() => setNextDisplayState("Online1")}>
          Online1
        </button>
        <button style={{ position: "absolute", marginLeft: "35rem", zIndex: "1" }} onClick={() => setNextDisplayState("Online2")}>
          Online2
        </button>

        <button style={{ position: "absolute", marginLeft: "40rem", zIndex: "1" }} onClick={() => setNextDisplayState("Login")}>
          Login
        </button>
        <button style={{ position: "absolute", marginLeft: "45rem", zIndex: "1" }} onClick={() => setNextDisplayState("CreateAccount")}>
          CreateAccount
        </button>
      </>
    );
  };
  
  const renderConditionaAuthContent = () => {
    switch (displayState) {
      case "Login":
        return <div className="tile slim blue" onClick={() => setNextDisplayState("CreateAccount")}></div>;
      case "CreateAccount":
        return <div className="tile slim cyan" onClick={() => setNextDisplayState("Login")}></div>;
    }
  };
      
  const renderConditionalGameContent = () => {
    switch (displayState) {
      case "Local":
        return (
          <motion.div 
          key="GameMenu" 
          initial={
            previousDisplayState.current == "Online1" || previousDisplayState.current == "Online2"
            ? variants.up(5)
            : variants.right(3)
          }
          animate={variants.present} 
          exit={
            nextDisplayState == "Online1" || nextDisplayState == "Online2"
            ? variants.up(5)
            : variants.right(3)
          }
          >
            <div className="tile slim red"></div>
          </motion.div>
        );
      case "Online1":
        return (
          <motion.div 
          layout key="GameMenu" layoutId="OnlineMenu"
          initial={
            previousDisplayState.current == "Local" 
            ? variants.down(3)
            : variants.right(3)
          }
          animate={variants.present} 
          exit={
            nextDisplayState == "Local"
            ? variants.down(3)
            : variants.right(3)
          }
          className="purple">
            <div className="tile slim yellow" onClick={() => setNextDisplayState("Online2")}></div>
          </motion.div>
        );
      case "Online2": 
        return (
          <>
            <motion.div 
            layout key="GameMenu" layoutId="OnlineMenu" 
            initial={false}
            exit={variants.right(3)}
            className="tile slim yellow" 
            onClick={() => setNextDisplayState("Online1")}></motion.div>
            <motion.div key="GameMenu2" layoutId="GameMenu2" 
            initial={ variants.right(3) } 
            animate={variants.present}
            exit={variants.right(3)}
            className="tile slim orange" 
            onClick={() => setNextDisplayState("Online1")}></motion.div>
          </>
            
        );
    }
  };

  return (
    <div>
      {testingButtons()}
      <motion.div
        
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
        {/* <AnimatePresence mode="popLayout" custom={nextDisplayState}>{renderConditionaAuthContent()}</AnimatePresence> */}
        <motion.div
          initial={ variants.down(3) }
          animate={ variants.present }
          className="tile thick green"
          onClick={() => setNextDisplayState("Home")}
        >{"Display State: " + displayState}<br />
        {"Last Display State: " + previousDisplayState.current}</motion.div>
        <AnimatePresence mode="popLayout">{renderConditionalGameContent()}</AnimatePresence>
      </motion.div>
    </div>
    // <>
    //   {testingButtons()}
    //   <div style={{ height: "100vh",backgroundColor: "white", 
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     justifyContent: "center"}}>
    //     <motion.div
    //      initial={{opacity: 0}}
    //      animate={variants.present}
    //     // variants={}
    //     className={"tile thick green"}>
    //     </motion.div>
    //   </div>
    // </>
  );
}

export default App;

function SlimTile({ key, position, color }) {
  return (
    <motion.div
      key={key}
      layout
      initial={position}
      animate={variants.present}
      exit={position}
      ><div className={"tile slim " + color}></div>
    </motion.div>
  )
}

const variants = {
  present: {
    x: "0rem",
    y: "0rem",
    opacity: 1
  },
  up: (num) => {
    return {
      y: `-${num}0rem`,
      opacity: 0,
    }
  },
  down: (num) => {
    return {
      y: `${num}0rem`,
      opacity: 0,
    }
  },
  left: (num) => {
    return {
      x: `-${num}0rem`,
      opacity: 0,
    }
  },
  right: (num) => {
    return {
      x: `${num}0rem`,
      opacity: 0,
    }
  },
};