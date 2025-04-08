import { useState } from "react";
import OpponentSearchResult from "../OpponentSearchResult";
import "../../styles/styles.css";

export default function OpponentSearch({}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} className="activeBorder mainMenu">
        <button
          style={{
            width: "80%",
            marginTop: "2.5rem",
            padding: "0.1rem 1rem 0.1rem 1rem",
          }}
          className="defaultBorder labelText"
        >
          SEARCH TERM
        </button>
        <div
          style={{
            width: "90%",
            marginTop: "3.4rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div style={{ width: "100%" }}>
              <OpponentSearchResult color={"#626262"}></OpponentSearchResult>
              <hr style={{ width: "100%", border: "0.1rem solid #b1b1b1", margin: "0rem 0 0.4rem" }} />
            </div>
          ))}
          <OpponentSearchResult color={"#626262"}></OpponentSearchResult>
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        <button
          style={{
            marginTop: "2.5rem",
            padding: "0.1rem 2.5rem 0.1rem 2.5rem",
          }}
          className="defaultBorder labelText"
        >
          PREV
        </button>
        <button
          style={{
            marginTop: "2.5rem",
            padding: "0.1rem 2.5rem 0.1rem 2.5rem",
          }}
          className="defaultBorder labelText"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
