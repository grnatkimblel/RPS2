import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";

function QuickdrawArenaDisplay({
  gameDisplayState,
  gameInfo,
  playHand,
  isAcceptingHandsInput,
  isConnected,
  setIsAcceptingHandsInput,
  setIsRunning,
  isRunning,
  run,
  navigate,
}) {
  const getScoreCards = (playerScore, isLeft) => {
    const border = isLeft ? "leftBorder" : "rightBorder";
    const cards = Array(gameDisplayState.numRoundsToWin)
      .fill(1)
      .map((el, i) => {
        const scoreColor = i < playerScore ? "submittable" : "notInteractableColor";
        return <div key={i} className={"scoreCards " + border + " " + scoreColor}></div>;
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
      <RunPopup
        setIsAcceptingHandsInput={setIsAcceptingHandsInput}
        setIsRunning={setIsRunning}
        isRunning={isRunning}
        run={() => {
          run();
        }}
        navigate={navigate}
      />
      <div className="title">{gameDisplayState.titleText}</div>
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
            <button style={{ marginLeft: "20px", marginTop: "-20px" }} className="notInteractableColor">
              {gameInfo.player1.username}
            </button>

            <div style={{ display: "flex", width: "60%", justifyContent: "end" }}>
              {getScoreCards(gameDisplayState.player1_score, true)}
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
            <div style={{ display: "flex", width: "60%" }}>{getScoreCards(gameDisplayState.player2_score, false)}</div>

            <button style={{ marginRight: "20px", marginTop: "-20px" }} className="notInteractableColor">
              {gameInfo.player2.username}
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
              <span style={{ marginLeft: "15px" }}>{getCBM(gameDisplayState.player1_CBM)}</span>
            </div>
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "auto",
                justifyContent: "space-between",
              }}
            >
              <div className="arenaEmoji">{gameInfo.player1.emoji}</div>
              <div className="arenaEmoji">{gameDisplayState.player1_hand}</div>
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
              <span style={{ marginRight: "5px" }}>{getCBM(gameDisplayState.player2_CBM)}</span>
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
              <div className="arenaEmoji">{gameDisplayState.player2_hand}</div>
              <div className="arenaEmoji">{gameInfo.player2.emoji}</div>
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
            <button style={{ width: "100%", height: "100%" }} className="notInteractableColor">
              What will you do?
            </button>
          </div>
          <div style={{ flex: 1, display: "flex" }} className="leftBorder">
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <button
                style={{ flex: 1 }}
                className={(isAcceptingHandsInput ? "defaultColor " : "notInteractableColor ") + "bottomBorder"}
                onClick={() => playHand("rock")}
              >
                Rock
              </button>
              <button
                style={{ flex: 1 }}
                className={isAcceptingHandsInput ? "defaultColor " : "notInteractableColor "}
                onClick={() => playHand("paper")}
              >
                Paper
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }} className="leftBorder">
              <button
                style={{ flex: 1 }}
                className={(isAcceptingHandsInput ? "defaultColor " : "notInteractableColor ") + "bottomBorder"}
                onClick={() => playHand("scissors")}
              >
                Scissors
              </button>
              {isConnected ? (
                <button
                  style={{ flex: 1 }}
                  className="defaultColor"
                  onClick={async () => {
                    setIsAcceptingHandsInput(false);
                    setIsRunning(true);
                  }}
                >
                  Run
                </button>
              ) : (
                <button
                  style={{ flex: 1 }}
                  className="defaultColor"
                  onClick={async () => {
                    navigate(PAGES.MAIN_MENU);
                  }}
                >
                  Leave
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RunPopup({ setIsAcceptingHandsInput, setIsRunning, isRunning, run, navigate }) {
  if (isRunning)
    return (
      <div
        style={{
          width: "40%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
        }}
        className="leftBorder rightBorder topBorder bottomBorder"
      >
        <button style={{ flex: 1, fontSize: "40px" }} className="notInteractableColor">
          Are you sure you want to run?
        </button>
        <div style={{ flex: 4, display: "flex" }}>
          <button
            style={{ flex: 1, paddingBottom: "20px" }}
            className="defaultColor"
            onClick={async () => {
              await run();
              navigate(PAGES.MAIN_MENU);
            }}
          >
            yes
          </button>
          <button
            style={{ flex: 1, paddingBottom: "20px" }}
            className="defaultColor leftBorder"
            onClick={() => {
              setIsAcceptingHandsInput(true);
              setIsRunning(false);
            }}
          >
            no
          </button>
        </div>
      </div>
    );
}

export default QuickdrawArenaDisplay;
