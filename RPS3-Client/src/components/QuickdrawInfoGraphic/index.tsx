import react from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

import EMOJIS from "../../enums/Emojis";
import Button from "../Button";
import DisplayStates from "../../enums/DisplayStates";

export default function QuickdrawInfoGraphic({ displayVariant, setDisplayState }) {
  return (
    <>
      <motion.div
        key="Quickdraw Infographic"
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          // backgroundColor: "var(--backgroundColor)",
        }}
        variants={displayVariant}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div
          style={{
            width: "1440px",
            //   height: "1024px",
            display: "flex",
            flexDirection: "column",
            //   justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "-2rem",
            }}
          >
            <div id="Title" style={{ alignSelf: "flex-start" }}>
              <div className={"RPS-Title"}>QUICKDRAW</div>
              <hr style={{ width: "105%", border: "0.6rem solid black", marginTop: "-1.5rem" }} />
            </div>
            <Button
              text={"GOT IT"}
              textStyle={"labelText"}
              styles={{ width: "fit-content", height: "fit-content", padding: "0.1rem 1rem" }}
              setDisplayState={setDisplayState}
              destination={DisplayStates.Quickdraw_Arena_Local}
            />
          </div>
          <div id="Subtitle" className={"RPS-Subtitle"} style={{ marginLeft: "1.5rem" }}>
            ROCK BEATS PAPER BEATS SCISSORS BEATS ROCK BEATS PAPER BEATS SCISSORS BEATS ROCK BEATS PAPER BEATS SCISSORS
            BEATS...
          </div>
          <div id="Player Controls" style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
            <div id="Player1 Controls" style={{ display: "flex" }}>
              <div className={"RPS-Subtitle"} style={{ marginTop: "2rem" }}>
                PLAYER 1
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.ROCK}</div>
                <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  (Q)
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.PAPER}</div>
                <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  (W)
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.SCISSORS}</div>
                <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  (E)
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.ORB}</div>
                <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  (TAB)
                </div>
              </div>
            </div>
            <div id="Player2 Controls" style={{ display: "flex" }}>
              <div id="Player1 Controls" style={{ display: "flex" }}>
                <div className={"RPS-Subtitle"} style={{ marginTop: "2rem" }}>
                  PLAYER 2
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                  <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.ROCK}</div>
                  <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                    (←)
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                  <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.PAPER}</div>
                  <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                    (↓)
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                  <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.SCISSORS}</div>
                  <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                    (→)
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignContent: "center" }}>
                  <div style={{ textAlign: "center", fontSize: "4rem" }}>{EMOJIS.ORB}</div>
                  <div className={"keyHints"} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                    (SHIFT)
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="Game Phase Explanation" style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
            <div id="Ready Phase Explanation" style={{ maxWidth: "30%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "5rem" }}>{EMOJIS.FLUTE}</div>
              <div className={"RPS-Subtitle"}>READY PHASE</div>
              <ul className="explanationText" style={{ textAlign: "left", marginTop: "0rem" }}>
                <li>
                  DONT SHOOT TO SOON! PLAY TOO EARLY AND EARN YOUR OPPONENT A <b className="purple">PURPLE POINT</b>
                </li>
                <li>KEEP YOUR HAND AT THE READY, ANY SECOND NOW YOU'LL HAVE TO...</li>
              </ul>
            </div>
            <div id="Ready Phase Explanation" style={{ maxWidth: "30%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "5rem" }}>{EMOJIS.BOMB}</div>
              <div className={"RPS-Subtitle"}>DRAW PHASE</div>
              <ul className="explanationText" style={{ textAlign: "left", marginTop: "0rem" }}>
                <li>
                  DRAW! FIRST PLAYER TO THROW A HAND EARNS A <b className="purple">PURPLE POINT</b>
                </li>
                <li>THE ROUND ISNT OVER YET, CHANGE YOUR HAND FREELY TO OUTWIT YOUR OPPONENT</li>
                <li>WRESTLE FOR THE WINNING HAND UNTIL...</li>
              </ul>
            </div>
            <div id="Ready Phase Explanation" style={{ maxWidth: "30%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "5rem" }}>{EMOJIS.POW}</div>
              <div className={"RPS-Subtitle"}>END PHASE</div>
              <ul className="explanationText" style={{ textAlign: "left", marginTop: "0rem" }}>
                <li>
                  ROUNDS OVER! HANDS ARE SCORED, WINNER GETS A <b className="blue">PERMANENT POINT</b>
                </li>
                <li>
                  SCORE = <b className="purple">PURPLE POINTS</b> + <b className="blue">PERMANENT POINTS</b>
                </li>
                <li>GAMES ARE FIRST TO 5</li>
              </ul>
            </div>
          </div>
          <div id="Purple Point Explanation" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <div id="Purple Point Explanation Title" style={{ display: "flex", alignSelf: "flex-start" }}>
              <div style={{ fontSize: "5rem" }}>{EMOJIS.ORB}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div className="RPS-Subtitle">
                  <b className="purple">PURPLE POINTS</b> CAN BE SPENT ON ABILITIES
                </div>
                <div className="explanationText" style={{ marginLeft: 0 }}>
                  1 POINT PER ABILITY
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "-3rem" }}>
              <div style={{ width: "25%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "4rem", textAlign: "center" }}>{EMOJIS.ICE}</div>
                <div className="explanationText">{"ACTIVE: \n OPPONENT CANNOT PLAY FOR 2 SECONDS"}</div>
              </div>
              <div style={{ width: "25%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "4rem", textAlign: "center" }}>{EMOJIS.GAMBLE}</div>
                <div className="explanationText">
                  CHOOSE ROCK PAPER OR SCISSORS. IF THE OPPONENTS NEXT SCORED HAND MATCHES, +2{" "}
                  <b className="blue">PERMANENT POINTS</b>
                </div>
              </div>
              <div style={{ width: "25%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "4rem", textAlign: "center" }}>{EMOJIS.RUN_IT_BACK}</div>
                <div className="explanationText">
                  INCREASE THE SCORE NEEDED TO WIN BY 2 (ACTIVATES IF YOU LOSE GAME-POINT)
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
