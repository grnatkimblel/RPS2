import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup , usePresenceData} from "motion/react";
import "./styles/texts.css";
import "./styles/styles.css";

function Test2() {
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
            <button style={{ position: "absolute", marginLeft: "30rem", zIndex: "1" }} onClick={() => setNextDisplayState("Online Gamemodes")}>
              Online1
            </button>
            <button style={{ position: "absolute", marginLeft: "35rem", zIndex: "1" }} onClick={() => setNextDisplayState("Online Matchmaking:Quickdraw")}>
              Quickdraw
            </button>
            <button style={{ position: "absolute", marginLeft: "40rem", zIndex: "1" }} onClick={() => setNextDisplayState("Online Matchmaking:TDM")}>
              TDM
            </button>
            <button style={{ position: "absolute", marginLeft: "45rem", zIndex: "1" }} onClick={() => setNextDisplayState("Online Matchmaking:Search")}>
              Search
            </button>
    
            <button style={{ position: "absolute", marginLeft: "50rem", zIndex: "1" }} onClick={() => setNextDisplayState("Login")}>
              Login
            </button>
            <button style={{ position: "absolute", marginLeft: "55rem", zIndex: "1" }} onClick={() => setNextDisplayState("CreateAccount")}>
              CreateAccount
            </button>
            <p style={{position: "absolute", marginLeft: "20rem" ,marginTop: "3rem", zIndex: "1"}}>{"Prev DisplayState: " + previousDisplayState.current}</p>
            <p style={{position: "absolute", marginLeft: "35rem" ,marginTop: "3rem", zIndex: "1"}}>{"DisplayState: " + displayState}</p>
          </>
        );
      };

    const ONLINE_MATCHMAKING_DISPLAY_STATES = ["Online Matchmaking:Quickdraw", "Online Matchmaking:TDM", "Online Matchmaking:Search"]

    const mainMenuVariants = {
        initial: {y: "1rem", opacity: 0},
        "Home": {x: 0, y: 0, opacity: 1},
        "Online Gamemodes": {x: "-14rem", y: 0, opacity: 1},
        "Online Matchmaking": {x: "-25rem", y: 0, opacity: 1},
        animate: (displayState) => ({
            opacity: 1,
            y:0,
            x: displayState == "Home"
            ? 0
            : displayState == "Online Gamemodes" || displayState == "Local"
            ? "-14rem"
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState)
            ? "-25rem"
            : "100vh"
        }) 
    }

    const localOrOnlineVariant = {
        "localInitial": (custom) => ({
            opacity: 0,
            x: custom.previousDisplayState == "Online Gamemodes" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState) 
            ? "14rem" : "30rem",
            y: custom.previousDisplayState == "Online Gamemodes" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState)
            ? "-30rem" : 0,
        }),       
        "onlineInitial": (custom) => ({
            opacity: 0,
            x: custom.previousDisplayState == "Local" ? "14rem" : "30rem",
            y: custom.previousDisplayState == "Local" ? "30rem" : 0,
        }),       
        "present": () => ({
            opacity: 1,
            x: ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState) ? "3rem" : "14rem", 
            y:0,
        }),
        "localExit": (custom) => ({
            opacity: 0,
            x: custom.nextDisplayState == "Home" ? "30rem" : "14rem",
            y: custom.nextDisplayState == "Home" ? 0 : "-30rem"
        }),
        "onlineExit": (custom) => ({
            opacity: 0,
            x: custom.nextDisplayState == "Home" 
            ? "30rem" 
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.displayState) ? "3rem" : "14rem",
            y: custom.nextDisplayState == "Home" ? 0 : "30rem"
        }),
    }

    const onlineMatchmakingVariant = {
        "quickdrawInitial": (custom) => ({
            opacity: 0,
            x: custom.previousDisplayState == "Online Gamemodes" 
            ? "55rem" 
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState) 
            ? "28rem"
            : "100vh",
            y: custom.previousDisplayState == "Online Gamemodes" 
            ? 0
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState) 
            ? "-30rem"
            : "100vh",
        }) ,
        "tdmInitial": (custom) => ({
            opacity: 0,
            x: custom.previousDisplayState == "Online Gamemodes" 
            ? "55rem" 
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState) 
            ? "28rem"
            : "100vh",
            y: custom.previousDisplayState == "Online Gamemodes" 
            ? 0
            : custom.previousDisplayState == "Online Matchmaking:Quickdraw"
            ? "30rem"
            : custom.previousDisplayState == "Online Matchmaking:Search"
            ? "-30rem"
            : "100vh",
        }) ,
        "searchInitial": (custom) => ({
            opacity: 0,
            x: custom.previousDisplayState == "Online Gamemodes" 
            ? "55rem" 
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState) 
            ? "28rem"
            : "100vh",
            y: custom.previousDisplayState == "Online Gamemodes" 
            ? 0
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.previousDisplayState) 
            ? "30rem"
            : "100vh",
        }) ,
        "present": {y: 0, x: "28rem", opacity: 1},
        "quickdrawExit": (custom) => ({
            opacity: 0,
            x: custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
            ? "28rem" 
            : "55rem" ,
            y: custom.nextDisplayState == "Local" 
            ? "30rem" 
            : ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
            ? "-30rem"
            : 0,
        }),
        "tdmExit": (custom) => ({
            opacity: 0,
            x: custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
            ? "28rem" 
            : "55rem" ,
            y: custom.nextDisplayState == "Local" || custom.nextDisplayState == "Online Matchmaking:Quickdraw" 
            ? "30rem" 
            : custom.nextDisplayState == "Online Matchmaking:Search" 
            ? "-30rem"
            : 0,
        }),
        "searchExit": (custom) => ({
            opacity: 0,
            x: custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
            ? "28rem" 
            : "55rem" ,
            y: custom.nextDisplayState == "Local" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(custom.nextDisplayState)
            ? "30rem" 
            : 0,
        }),
    }

    return (
        <>
        {testingButtons()}
        <div style={{  
            display: "flex",
            height: "100vh",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"}}>
            <AnimatePresence>
                <motion.div
                key="MainMenu"
                initial="initial"
                animate="animate"
                variants={mainMenuVariants}
                custom={displayState}
                className={"tile thick green"}  
                ></motion.div>
                
                {displayState == "Local"
                ? <motion.div  
                key="Local" 
                initial="localInitial"
                animate="present"
                exit="localExit"
                variants={localOrOnlineVariant}
                custom={{nextDisplayState: nextDisplayState, displayState: displayState, previousDisplayState: previousDisplayState.current}}
                className={"tile slim yellow"}></motion.div>
                : null} 

                {displayState == "Online Gamemodes" || ONLINE_MATCHMAKING_DISPLAY_STATES.includes(displayState)
                ? <motion.div  
                key="Online" 
                initial="onlineInitial"
                animate="present"
                exit="onlineExit"
                variants={localOrOnlineVariant}
                custom={{nextDisplayState: nextDisplayState, displayState: displayState, previousDisplayState: previousDisplayState.current}}
                className={"tile slim blue"}></motion.div>
                : null} 

                {displayState == "Online Matchmaking:Quickdraw"
                ? <motion.div
                key="Matchmaking:Quickdraw" 
                initial="quickdrawInitial"
                animate="present"
                exit="quickdrawExit"
                variants={onlineMatchmakingVariant}
                custom={{nextDisplayState: nextDisplayState, displayState: displayState, previousDisplayState: previousDisplayState.current}}
                className={"tile slim red"}></motion.div> 
                : null}
                {displayState == "Online Matchmaking:TDM"
                ? <motion.div
                key="Matchmaking:TDM" 
                initial="tdmInitial"
                animate="present"
                exit="tdmExit"
                variants={onlineMatchmakingVariant}
                custom={{nextDisplayState: nextDisplayState, displayState: displayState, previousDisplayState: previousDisplayState.current}}
                className={"tile slim orange"}></motion.div> 
                : null}
                {displayState == "Online Matchmaking:Search"
                ? <motion.div
                key="Matchmaking:Search" 
                initial="searchInitial"
                animate="present"
                exit="searchExit"
                variants={onlineMatchmakingVariant}
                custom={{nextDisplayState: nextDisplayState, displayState: displayState, previousDisplayState: previousDisplayState.current}}
                className={"tile slim purple"}></motion.div> 
                : null}

                //add remaining matchmaking tiles
            </AnimatePresence>
        </div>
        </>
    );
}

export default Test2;

function MenuItem({ tiles }) {
    //tiles = [] of components in order top to bottom. A comparison can be made to determine if the transition should be up or down.

    return (
        <motion.div
        exit={variants.down(3, false)}></motion.div>
    )
}

const variants = {
    present: {
      x: "0rem",
      y: "0rem",
      opacity: 1
    },
    up: (num, isVisible) => {
      return {
        y: `-${num}rem`,
        opacity: isVisible ? 1 : 0,
      }
    },
    down: (num, isVisible) => {
      return {
        y: `${num}rem`,
        opacity: isVisible ? 1 : 0,
      }
    },
    left: (num, isVisible) => {
      return {
        x: `-${num}rem`,
        opacity: isVisible ? 1 : 0,
      }
    },
    right: (num, isVisible) => {
      return {
        x: `${num}rem`,
        opacity: isVisible ? 1 : 0,
      }
    },
  };