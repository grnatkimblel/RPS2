import { useState } from "react";
import { motion, usePresenceData } from "motion/react";
import "../../styles/styles.css";
import { scale } from "svelte/transition";

import Button from "../Button";

export default function QuickdrawArenaDisplay({ setDisplayState, gameInfo }) {
  return (
    <motion.div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
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
        <div style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              height: "6rem",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <div
              className="defaultText"
              style={{
                textDecoration: "underline var(--tileBorderColor_Active) 2px",
                alignSelf: "flex-end",
                marginLeft: "2rem",
              }}
            >
              PLAYER 1
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "flex-end" }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    style={{ marginRight: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}
                    key={index}
                  >
                    <svg width="12" height="38" viewBox="0 0 12 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="12" height="38" rx="5" fill="#007AFF" />
                    </svg>
                    <div
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
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    style={{ marginLeft: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}
                    key={index}
                  >
                    <svg width="12" height="38" viewBox="0 0 12 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="12" height="38" rx="5" fill="#007AFF" />
                    </svg>
                    <div
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
            <div
              className="defaultText"
              style={{
                textDecoration: "underline var(--tileBorderColor_Active) 2px",
                alignSelf: "flex-end",
                marginRight: "2rem",
              }}
            >
              PLAYER 2
            </div>
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
            <Button text={"🔮"} styles={{ fontSize: "3rem", width: "6rem", height: "6rem" }} />
            <div style={{ zIndex: "2", marginTop: "-1rem" }} className="RPS-Title">
              RPS
            </div>
            <Button text={"🔮"} styles={{ fontSize: "3rem", width: "6rem", height: "6rem" }} />
          </div>
          <div
            style={{
              width: "100%",
              height: "25rem",
              display: "flex",
              justifyContent: "center",
              marginTop: "-4rem",
            }}
          >
            <div style={{ fontSize: "10rem", alignSelf: "flex-end", marginRight: "5rem" }}>🫱</div>
            <div style={{ fontSize: "10rem" }}>💣</div>
            <div style={{ fontSize: "10rem", alignSelf: "flex-end", marginLeft: "5rem" }}>🫲</div>
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <Button text={"🗿"} textStyle="active" styles={{ fontSize: "6rem", width: "10rem", height: "10rem" }} />
              <div className="keyHints">(Q)</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <Button text={"📄"} textStyle="active" styles={{ fontSize: "6rem", width: "10rem", height: "10rem" }} />
              <div className="keyHints">(W)</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <Button text={"✂️"} textStyle="active" styles={{ fontSize: "6rem", width: "10rem", height: "10rem" }} />
              <div className="keyHints">(E)</div>
            </div>
          </div>
          <Button
            setDisplayState={setDisplayState}
            destination={"Home"}
            text={"BACK"}
            textStyle={"labelText"}
            styles={{ width: "fit-content", padding: "0.1rem 1rem" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
