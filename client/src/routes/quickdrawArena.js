import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";
import API_ROUTES from "../enums/apiRoutes";

import { useEffect, useState } from "react";

function QuickdrawArena({}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        <div
          style={{ flex: 1 }}
          className="notInteractableColor bottomBorder"
        ></div>
        <div
          style={{ flex: 1 }}
          className="notInteractableColor bottomBorder leftBorder"
        ></div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 6,
        }}
      >
        <div
          style={{ flex: 1 }}
          className="notInteractableColor bottomBorder"
        ></div>
        <div
          style={{ flex: 1 }}
          className="notInteractableColor bottomBorder leftBorder"
        ></div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 2,
        }}
      >
        <div style={{ flex: 1 }} className="notInteractableColor">
          What will you do?
        </div>
        <div style={{ flex: 1, display: "flex" }} className="leftBorder">
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }} className="defaultColor bottomBorder">
              a
            </div>
            <div style={{ flex: 1 }} className="defaultColor bottomBorder">
              b
            </div>
          </div>
          <div
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
            className="leftBorder"
          >
            <div style={{ flex: 1 }} className="defaultColor bottomBorder">
              c
            </div>
            <div style={{ flex: 1 }} className="defaultColor bottomBorder">
              d
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickdrawArena;
