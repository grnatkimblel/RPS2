import { useEffect, useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";

import QuickdrawSessionData from "../../types/QuickdrawSessionData";
import QuickdrawArenaViewModel from "../../types/QuickdrawArenaViewModel";
import GamePhases from "../../enums/GamePhases";
import EMOJIS from "../../enums/Emojis";

import Button from "../Button";
import { filter, s } from "motion/react-client";

interface onClicks {
  Rock: () => void;
  Paper: () => void;
  Scissors: () => void;
  PlayAgain: () => void;
  Quit: () => void;
  BuyFreeze: () => void;
  BuyGamble: () => void;
  BuyRunItBack: () => void;
}

interface QuickdrawArenaViewProps {
  localOrOnline: "Local" | "Online";
  viewModel: QuickdrawArenaViewModel;
  onClicks: onClicks;
  setMainDisplayState: (state: string) => void;
  quickdrawSessionData: QuickdrawSessionData; // Adjust the type as needed
  showGameOverModal: Boolean;
  setShowGameOverModal: (state: boolean) => void;
  isLeftShopOpen: Boolean;
  setIsLeftShopOpen: (state: boolean) => void;
  isLeftGambling: Boolean;
  isRightShopOpen: Boolean;
  setIsRightShopOpen: (state: boolean) => void;
  isRightGambling: Boolean;
}

export default function QuickdrawArenaView({
  localOrOnline,
  viewModel,
  onClicks,
  setMainDisplayState,
  quickdrawSessionData,
  showGameOverModal,
  setShowGameOverModal,
  isLeftShopOpen,
  setIsLeftShopOpen,
  isLeftGambling,
  isRightShopOpen,
  setIsRightShopOpen,
  isRightGambling,
}: QuickdrawArenaViewProps) {
  const [showExitModal, setShowExitModal] = useState<Boolean>(false);
  const [showKeyHints, setShowKeyHints] = useState<Boolean>(false);

  function displayOnlineHandButtons() {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Button
            text={EMOJIS.ROCK}
            textStyle="active"
            styles={{ fontSize: "6rem", width: "10rem", height: "10rem" }}
            onClick={onClicks.Rock}
            onMouseEnter={() => {
              setShowKeyHints(true);
            }}
            onMouseLeave={() => {
              setShowKeyHints(false);
            }}
            whileHover={false}
          />
          <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(Q)</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Button
            text={EMOJIS.PAPER}
            textStyle="active"
            styles={{ fontSize: "6rem", width: "10rem", height: "10rem" }}
            onClick={onClicks.Paper}
            onMouseEnter={() => {
              setShowKeyHints(true);
            }}
            onMouseLeave={() => {
              setShowKeyHints(false);
            }}
            whileHover={false}
          />
          <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(W)</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Button
            text={EMOJIS.SCISSORS}
            textStyle="active"
            styles={{ fontSize: "6rem", width: "10rem", height: "10rem" }}
            onClick={onClicks.Scissors}
            onMouseEnter={() => {
              setShowKeyHints(true);
            }}
            onMouseLeave={() => {
              setShowKeyHints(false);
            }}
            whileHover={false}
          />
          <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(E)</div>
        </div>
      </div>
    );
  }

  function displayLocalHandButtons(isLeftShopOpen, isRightShopOpen) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isLeftGambling && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "3.5rem",
                  transform: "translate(-4.6rem, -2.5rem)",
                  zIndex: 2,
                }}
              >
                {EMOJIS.GAMBLE}
              </div>
            )}
            <Button
              text={isLeftGambling ? EMOJIS.ROCK : isLeftShopOpen ? EMOJIS.ICE : EMOJIS.ROCK}
              textStyle="active"
              styles={{ fontSize: "6rem", width: "10rem", height: "10rem", textAlign: "center" }}
              onClick={() => onClicks.Rock(true)}
              onMouseEnter={() => {
                setShowKeyHints(true);
              }}
              onMouseLeave={() => {
                setShowKeyHints(false);
              }}
            ></Button>
            <div className={showKeyHints ? "keyHints" : "keyHints invisible"}>(Q)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isLeftGambling && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "3.5rem",
                  transform: "translate(-4.6rem, -2.5rem)",
                  zIndex: 2,
                }}
              >
                {EMOJIS.GAMBLE}
              </div>
            )}
            <Button
              text={isLeftGambling ? EMOJIS.PAPER : isLeftShopOpen ? EMOJIS.GAMBLE : EMOJIS.PAPER}
              textStyle="active"
              styles={{ fontSize: "6rem", width: "10rem", height: "10rem", textAlign: "center" }}
              onClick={() => onClicks.Paper(true)}
              onMouseEnter={() => {
                setShowKeyHints(true);
              }}
              onMouseLeave={() => {
                setShowKeyHints(false);
              }}
            ></Button>
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(W)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isLeftGambling && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "3.5rem",
                  transform: "translate(-4.6rem, -2.5rem)",
                  zIndex: 2,
                }}
              >
                {EMOJIS.GAMBLE}
              </div>
            )}
            <Button
              text={isLeftGambling ? EMOJIS.SCISSORS : isLeftShopOpen ? EMOJIS.RUN_IT_BACK : EMOJIS.SCISSORS}
              textStyle="active"
              styles={{ fontSize: "6rem", width: "10rem", height: "10rem", textAlign: "center" }}
              onClick={() => onClicks.Scissors(true)}
              onMouseEnter={() => {
                setShowKeyHints(true);
              }}
              onMouseLeave={() => {
                setShowKeyHints(false);
              }}
            ></Button>
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(E)</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isRightGambling && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "3.5rem",
                  transform: "translate(-4.6rem, -2.5rem)",
                  zIndex: 2,
                }}
              >
                {EMOJIS.GAMBLE}
              </div>
            )}
            <Button
              text={isRightGambling ? EMOJIS.ROCK : isRightShopOpen ? EMOJIS.ICE : EMOJIS.ROCK}
              textStyle="active"
              styles={{ fontSize: "6rem", width: "10rem", height: "10rem", textAlign: "center" }}
              onClick={() => onClicks.Rock(false)}
              onMouseEnter={() => {
                setShowKeyHints(true);
              }}
              onMouseLeave={() => {
                setShowKeyHints(false);
              }}
            ></Button>
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(← )</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isRightGambling && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "3.5rem",
                  transform: "translate(-4.6rem, -2.5rem)",
                  zIndex: 2,
                }}
              >
                {EMOJIS.GAMBLE}
              </div>
            )}
            <Button
              text={isRightGambling ? EMOJIS.PAPER : isRightShopOpen ? EMOJIS.GAMBLE : EMOJIS.PAPER}
              textStyle="active"
              styles={{ fontSize: "6rem", width: "10rem", height: "10rem", textAlign: "center" }}
              onClick={() => onClicks.Paper(false)}
              onMouseEnter={() => {
                setShowKeyHints(true);
              }}
              onMouseLeave={() => {
                setShowKeyHints(false);
              }}
            ></Button>
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(↓ )</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isRightGambling && (
              <div
                style={{
                  position: "absolute",
                  fontSize: "3.5rem",
                  transform: "translate(-4.6rem, -2.5rem)",
                  zIndex: 2,
                }}
              >
                {EMOJIS.GAMBLE}
              </div>
            )}
            <Button
              text={isRightGambling ? EMOJIS.SCISSORS : isRightShopOpen ? EMOJIS.RUN_IT_BACK : EMOJIS.SCISSORS}
              textStyle="active"
              styles={{ fontSize: "6rem", width: "10rem", height: "10rem", textAlign: "center" }}
              onClick={() => onClicks.Scissors(false)}
              onMouseEnter={() => {
                setShowKeyHints(true);
              }}
              onMouseLeave={() => {
                setShowKeyHints(false);
              }}
            ></Button>
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(→ )</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <motion.div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "var(--backgroundColor)",
      }}
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
        {showExitModal && <ExitModal setShowExitModal={setShowExitModal} onClickYes={onClicks.Quit} />}
        {showGameOverModal && (
          <GameOverModal
            winner={
              viewModel.player1WonLastGame
                ? quickdrawSessionData.player1.username
                : quickdrawSessionData.player2.username
            }
            onClickPlayAgain={onClicks.PlayAgain}
            onClickQuit={onClicks.Quit}
          />
        )}
        <div style={{ width: "100%" }}>
          <div // Player Names and scoreboard
            style={{
              width: "100%",
              height: "6rem",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              position: "relative",
            }}
          >
            <div //player 1 Name Display
              className="defaultText"
              style={{
                textDecoration: "underline var(--tileBorderColor_Active) 2px",
                alignSelf: "flex-end",
                marginLeft: "2rem",
              }}
            >
              {viewModel.player1WonLastGame == true
                ? "👑 " + quickdrawSessionData.player1.username + ": " + viewModel.player1_winCount
                : quickdrawSessionData.player1.username + ": " + viewModel.player1_winCount}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                position: "absolute",
                left: "50%",
                transform: " translateX(-50%)",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "flex-end" }}>
                {Array.from({ length: viewModel.numRoundsToWin }).map((_, index) => (
                  <div //player 1 scoreboard
                    style={{ marginRight: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}
                    key={index}
                  >
                    {index < viewModel.player1_score && (
                      <svg width="12" height="38" viewBox="0 0 12 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="12" height="38" rx="5" fill="#007AFF" />
                      </svg>
                    )}
                    {viewModel.player1_purplePoints > 0 &&
                      index >= viewModel.player1_score &&
                      index < viewModel.player1_score + viewModel.player1_purplePoints && (
                        <svg width="12" height="38" viewBox="0 0 12 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="12" height="38" rx="5" fill="#A300BD" />
                        </svg>
                      )}
                    <div //underline
                      style={{
                        marginTop: "5px",
                        width: "30px",
                        height: "2px",
                        backgroundColor: "var(--tileBorderColor_Active)",
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div style={{ width: "2px", backgroundColor: "var(--tileBorderColor_Active)" }}></div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                {Array.from({ length: viewModel.numRoundsToWin }).map((_, index) => (
                  <div //player 2 scoreboard
                    style={{ marginLeft: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}
                    key={index}
                  >
                    {index < viewModel.player2_score && (
                      <svg width="12" height="38" viewBox="0 0 12 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="12" height="38" rx="5" fill="#007AFF" />
                      </svg>
                    )}
                    {viewModel.player2_purplePoints > 0 &&
                      index >= viewModel.player2_score &&
                      index < viewModel.player2_score + viewModel.player2_purplePoints && (
                        <svg width="12" height="38" viewBox="0 0 12 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="12" height="38" rx="5" fill="#A300BD" />
                        </svg>
                      )}
                    <div //underline
                      style={{
                        marginTop: "5px",
                        width: "30px",
                        height: "2px",
                        backgroundColor: "var(--tileBorderColor_Active)",
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            <div //player 2 Name Display
              className="defaultText"
              style={{
                textDecoration: "underline var(--tileBorderColor_Active) 2px",
                alignSelf: "flex-end",
                marginRight: "2rem",
              }}
            >
              {viewModel.player1WonLastGame == false
                ? "👑 " + quickdrawSessionData.player2.username + ": " + viewModel.player2_winCount
                : quickdrawSessionData.player2.username + ": " + viewModel.player2_winCount}
            </div>
          </div>
          <div style={{ width: "100%", display: "flex" }}>
            <PointMenu
              isRight={false}
              showKeyHints={showKeyHints}
              setShowKeyHints={setShowKeyHints}
              isLeftShopOpen={isLeftShopOpen}
              setIsLeftShopOpen={setIsLeftShopOpen}
              isRightShopOpen={isRightShopOpen}
              setIsRightShopOpen={setIsRightShopOpen}
              buyFreeze={onClicks.BuyFreeze}
              buyGamble={onClicks.BuyGamble}
              buyRunItBack={onClicks.BuyRunItBack}
            />
            <div style={{ zIndex: "2", marginTop: "-1rem", flex: "2", display: "flex", justifyContent: "center" }}>
              <div className="RPS-Title">RPS</div>
            </div>
            <PointMenu
              isRight={true}
              showKeyHints={showKeyHints}
              setShowKeyHints={setShowKeyHints}
              isLeftShopOpen={isLeftShopOpen}
              setIsLeftShopOpen={setIsLeftShopOpen}
              isRightShopOpen={isRightShopOpen}
              setIsRightShopOpen={setIsRightShopOpen}
              buyFreeze={onClicks.BuyFreeze}
              buyGamble={onClicks.BuyGamble}
              buyRunItBack={onClicks.BuyRunItBack}
            />
          </div>
          <div // Player Hands and Game Phase indicator
            style={{
              width: "100%",
              height: "20rem",
              display: "flex",
              justifyContent: "space-between",
              marginTop: "-2rem",
              marginBottom: "3rem",
            }}
          >
            <AbilityIndicator
              hasFreeze={viewModel.player1_hasFreeze}
              hasGamble={viewModel.player1_hasGamble}
              hasCurrentGamble={viewModel.player1_activeGamble}
              hasRunItBack={viewModel.player1_hasRunItBack}
              showKeyHints={showKeyHints}
              showExitModal={showExitModal}
              showGameOverModal={showGameOverModal}
            />
            <div style={{ fontSize: "12rem", alignSelf: "flex-end", marginRight: "2rem" }}>
              {viewModel.player1_hand}
            </div>
            <div style={{ fontSize: "6rem" }} className="defaultText">
              {viewModel.titleText}
            </div>
            <div style={{ fontSize: "12rem", alignSelf: "flex-end", marginLeft: "2rem" }}>{viewModel.player2_hand}</div>
            <AbilityIndicator
              isRight={true}
              hasFreeze={viewModel.player2_hasFreeze}
              hasGamble={viewModel.player2_hasGamble}
              hasCurrentGamble={viewModel.player2_activeGamble}
              hasRunItBack={viewModel.player2_hasRunItBack}
              showKeyHints={showKeyHints}
              showExitModal={showExitModal}
              showGameOverModal={showGameOverModal}
            />
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: localOrOnline === "Local" ? "space-around" : "center",
              gap: "1rem",
            }}
          >
            {localOrOnline === "Online" && displayOnlineHandButtons()}
            {localOrOnline === "Local" && displayLocalHandButtons(isLeftShopOpen, isRightShopOpen)}
          </div>
          <Button
            onClick={() => setShowExitModal(true)}
            text={"BACK"}
            textStyle={"labelText"}
            styles={{ width: "fit-content", padding: "0.1rem 1rem", marginLeft: "1rem" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function AbilityIndicator({
  isRight,
  hasFreeze,
  hasGamble,
  hasCurrentGamble,
  hasRunItBack,
  showKeyHints,
  showExitModal,
  showGameOverModal,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: isRight ? "flex-end" : "flex-start",
        marginLeft: isRight ? "0" : "1.3rem",
        marginRight: isRight ? "1.3rem" : "0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {isRight && <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(↑)</div>}
        <div
          style={{ fontSize: "4rem" }}
          className={hasFreeze ? (showExitModal || showGameOverModal ? "" : "ice-glow") : "ability-transparency"}
        >
          {EMOJIS.ICE}
        </div>
        {!isRight && <div className={showKeyHints ? "keyHints " : "keyHints invisible"}>(1)</div>}
      </div>
      <div
        style={{ fontSize: "4rem" }}
        className={hasGamble ? (showExitModal || showGameOverModal ? "" : "yellow-glow") : "ability-transparency"}
      >
        {EMOJIS.GAMBLE}
      </div>
      <div
        style={{ fontSize: "4rem" }}
        className={hasRunItBack ? (showExitModal || showGameOverModal ? "" : "red-glow") : "ability-transparency"}
      >
        {EMOJIS.RUN_IT_BACK}
      </div>
    </div>
  );
}

function PointMenu({
  isRight,
  showKeyHints,
  setShowKeyHints,
  isLeftShopOpen,
  setIsLeftShopOpen,
  isRightShopOpen,
  setIsRightShopOpen,
}) {
  // const [isExpanded, setIsExpanded] = useState(false);

  const expandedStyles = {
    width: "32rem",
    padding: "1rem",
    border: "0.6rem solid var(--tileBorderColor_Default)",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    backgroundColor: "var(--backgroundColor)",
    // top: "50%",
    zIndex: "1",
  };

  const StoreSlot = ({ emoji, description, onClick }) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "1rem",
        }}
      >
        <div style={{ fontSize: "4rem", flex: 1 }}>{emoji}</div>
        <div className="descriptionText">{description}</div>
        {/* <Button
          text={"BUY"}
          onClick={onClick}
          textStyle="labelText"
          styles={{ flex: 1, paddingLeft: "1rem", paddingRight: "1rem" }}
        /> */}
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 4,
        display: "flex",
        flexDirection: isRight ? "row-reverse" : "",
        marginLeft: isRight ? "" : "1rem",
        marginRight: isRight ? "1rem" : "",
        marginTop: "1rem",
      }}
    >
      {(isRight && isRightShopOpen) || (!isRight && isLeftShopOpen) ? (
        <motion.div
          text={EMOJIS.POW}
          style={expandedStyles}
          whileHover={{ scale: 1.01 }}
          onMouseEnter={() => {
            setShowKeyHints(true);
          }}
          onMouseLeave={() => {
            setShowKeyHints(false);
          }}
          onClick={() => {
            // setIsExpanded((isExpanded) => !isExpanded);
            isRight ? setIsRightShopOpen(false) : setIsLeftShopOpen(false);
          }}
        >
          <div style={{ alignSelf: "center" }} className="labelText">
            1x PURPLE POINT
          </div>
          <StoreSlot
            emoji={EMOJIS.ICE}
            description={"Active:\nOpponent cannot play hands for 2 seconds"}
            // onClick={(event) => {
            //   event.stopPropagation();
            //   buyFreeze(!isRight);
            // }}
          />
          <hr style={{ alignSelf: "center", width: "90%", border: "0.1rem solid #b1b1b1", margin: 0 }} />
          <StoreSlot
            emoji={EMOJIS.GAMBLE}
            description={"Choose\nRock Paper or Scissor\nIf opponents next scored hand matches, gain 2 points."}
            // onClick={(event) => {
            //   event.stopPropagation();
            //   buyGamble(!isRight);
            // }}
          />
          <hr style={{ alignSelf: "center", width: "90%", border: "0.1rem solid #b1b1b1", margin: 0 }} />
          <StoreSlot
            emoji={EMOJIS.RUN_IT_BACK}
            description={"Increase the score needed to win by 2 (Activates if you lose game-point)"}
            // onClick={(event) => {
            //   event.stopPropagation();
            //   buyRunItBack(!isRight);
            // }}
          />
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "row" }}>
          {isRight && (
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"} style={{ paddingRight: "1rem" }}>
              (SHIFT)
            </div>
          )}
          <Button
            text={EMOJIS.ORB}
            styles={{ fontSize: "3rem", width: "6rem", height: "6rem" }}
            onClick={() => {
              console.log(isLeftShopOpen);
              console.log(isRightShopOpen);
              // setIsExpanded((isExpanded) => !isExpanded);
              isRight ? setIsRightShopOpen(true) : setIsLeftShopOpen(true);
            }}
            onMouseEnter={() => {
              setShowKeyHints(true);
            }}
            onMouseLeave={() => {
              setShowKeyHints(false);
            }}
          />
          {!isRight && (
            <div className={showKeyHints ? "keyHints " : "keyHints invisible"} style={{ paddingLeft: "1rem" }}>
              (TAB)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExitModal({ setShowExitModal, onClickYes }) {
  const styles = {
    width: "32rem",
    border: "0.6rem solid var(--tileBorderColor_Default)",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    translate: "0 -50%",
    backgroundColor: "var(--backgroundColor)",
    zIndex: "10",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(5px)",
      }}
    >
      <div style={styles}>
        <div className={"defaultText"} style={{ padding: "1rem" }}>
          ARE YOU SURE?
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
          <Button text={"YES"} textStyle={"labelText"} styles={{ margin: "1rem" }} onClick={onClickYes} />
          <Button
            text={"NO"}
            textStyle={"labelText"}
            styles={{ margin: "1rem" }}
            onClick={() => setShowExitModal(false)}
          />
        </div>
      </div>
    </motion.div>
  );
}

function GameOverModal({ winner, onClickPlayAgain, onClickQuit }) {
  const styles = {
    width: "32rem",
    border: "0.6rem solid var(--tileBorderColor_Default)",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    translate: "0 -50%",
    backgroundColor: "var(--backgroundColor)",
    zIndex: "10",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(5px)",
      }}
    >
      <div style={styles}>
        <div className={"defaultText"} style={{ paddingTop: "1rem", textAlign: "center" }}>
          {winner + " WON!"}
        </div>
        <div className={"defaultText"} style={{ textAlign: "center" }}>
          PLAY AGAIN?
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
          <Button text={"YES"} textStyle={"labelText"} styles={{ margin: "1rem" }} onClick={onClickPlayAgain} />
          <Button text={"QUIT"} textStyle={"labelText"} styles={{ margin: "1rem" }} onClick={onClickQuit} />
        </div>
      </div>
    </motion.div>
  );
}
