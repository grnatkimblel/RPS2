import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import { useEffect, useState } from "react";

function QuickdrawArena({ navigate }) {
  const [titleText, setTitleText] = useState("RPS");
  const [numRounds, setNumRounds] = useState(3);
  const [player1_score, setPlayer1_score] = useState(0);
  const [player1_CBM, setPlayer1_CBM] = useState(0);
  const [player2_score, setPlayer2_score] = useState(0);
  const [player2_CBM, setPlayer2_CBM] = useState(0);

  const getScoreCards = (playerScore, isLeft) => {
    const border = isLeft ? "leftBorder" : "rightBorder";
    const cards = Array(numRounds)
      .fill(1)
      .map((el, i) => {
        const scoreColor =
          i < playerScore ? "submittable" : "notInteractableColor";
        return (
          <div
            key={i}
            className={"scoreCards " + border + " " + scoreColor}
          ></div>
        );
      });
    return isLeft ? cards : cards.reverse();
  };

  const getCBM = (playerCBM) => {
    const text = ["C", "B", "M"];
    const CBM = text.map((letter, i) => {
      const color = i < playerCBM ? "submittable" : "notInteractableColor";
      return (
        <span
          style={{
            letterSpacing: "10px",
            fontFamily: "ComicSans",
            fontSize: "60px",
          }}
          key={i}
          className={color}
        >
          {letter}
        </span>
      );
    });
    return CBM;
  };

  return (
    <>
      <div className="title">{titleText}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          id="topRow"
          style={{
            display: "flex",
            flex: 1,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
            className="notInteractableColor bottomBorder topRow"
          >
            <button
              style={{ marginLeft: "20px", marginTop: "-20px" }}
              className="notInteractableColor"
            >
              grant
            </button>

            <div
              style={{ display: "flex", width: "60%", justifyContent: "end" }}
            >
              {getScoreCards(player1_score, true)}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
            className="notInteractableColor bottomBorder leftBorder topRow"
          >
            <div style={{ display: "flex", width: "60%" }}>
              {getScoreCards(player2_score, false)}
            </div>

            <button
              style={{ marginRight: "20px", marginTop: "-20px" }}
              className="notInteractableColor"
            >
              jake
            </button>
          </div>
        </div>
        <div
          id="middleRow"
          style={{
            display: "flex",
            flex: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
            }}
            className="notInteractableColor bottomBorder"
          >
            <div style={{ position: "absolute" }}>
              {/* <StatsButton /> */}
              <span style={{ marginLeft: "15px" }}>{getCBM(player1_CBM)}</span>
            </div>
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "auto",
                justifyContent: "space-between",
              }}
            >
              <div className="arenaEmoji">🤔</div>
              <div className="arenaEmoji">🗿</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
            }}
            className="notInteractableColor bottomBorder leftBorder"
          >
            <div style={{ position: "absolute", right: "0" }}>
              <span style={{ marginRight: "5px" }}>{getCBM(player2_CBM)}</span>
              {/* <StatsButton /> */}
            </div>
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "auto",
                justifyContent: "space-between",
              }}
            >
              <div className="arenaEmoji">🗿</div>
              <div className="arenaEmoji">🤔</div>
            </div>
          </div>
        </div>
        <div
          id="bottomRow"
          style={{
            display: "flex",
            flex: 2,
          }}
        >
          <div style={{ flex: 1 }}>
            <button
              style={{ width: "100%", height: "100%" }}
              className="notInteractableColor"
            >
              What will you do?
            </button>
          </div>
          <div style={{ flex: 1, display: "flex" }} className="leftBorder">
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <button style={{ flex: 1 }} className="defaultColor bottomBorder">
                Rock
              </button>
              <button style={{ flex: 1 }} className="defaultColor">
                Paper
              </button>
            </div>
            <div
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
              className="leftBorder"
            >
              <button style={{ flex: 1 }} className="defaultColor bottomBorder">
                Scissors
              </button>
              <button
                style={{ flex: 1 }}
                className="defaultColor"
                onClick={() => navigate(`/${PAGES.MAIN_MENU}`)}
              >
                Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatsButton({ playerStats }) {
  const [isExpanded, setIsExpanded] = useState(false);
  //   console.log(isExpanded);
  return isExpanded ? (
    <div className="stats">
      <div
        style={{ padding: "20px" }}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
        }}
      >
        <div>Rock</div>
        <div>Paper</div>
        <div>Scissors</div>
        <div>Proactive</div>
        <div>Reactive</div>
      </div>
      <div style={{ pointerEvents: "none" }}>
        <button
          style={{ pointerEvents: "auto" }}
          className="defaultColor topBorder secondary"
        >
          All Time
        </button>
      </div>
    </div>
  ) : (
    <button
      style={{ padding: "20px" }}
      className="stats"
      onClick={() => setIsExpanded(true)}
    >
      📖
    </button>
  );
}

export default QuickdrawArena;
