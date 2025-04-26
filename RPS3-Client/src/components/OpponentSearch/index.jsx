import { useState } from "react";
import OpponentSearchResult from "../OpponentSearchResult";
import "../../styles/styles.css";
import { motion } from "motion/react";

import Tile from "../Tile";
import Button from "../Button";

export default function OpponentSearch({}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Tile size={"thick"} isActive={true}>
        <motion.input
          type="search"
          placeholder="SEARCH NAME"
          autoFocus="true"
          initial={{ borderColor: "var(--tileBorderColor_Default)" }}
          whileHover={{ borderColor: "var(--tileBorderColor_Active)" }}
          whileFocus={{ borderColor: "var(--tileBorderColor_Active)" }}
          style={{
            width: "80%",
            marginTop: "2rem",
            padding: "0.1rem 1rem 0.1rem 1rem",
          }}
          className="labelText"
        />
        <div
          style={{
            width: "90%",
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div style={{ width: "100%" }}>
              <OpponentSearchResult></OpponentSearchResult>
              <hr style={{ width: "100%", border: "0.1rem solid #b1b1b1", margin: "0 0 0.4rem" }} />
            </div>
          ))}
          <OpponentSearchResult></OpponentSearchResult>
        </div>
      </Tile>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        <Button
          text={"PREV"}
          textStyle={"labelText"}
          styles={{
            width: "auto",
            marginTop: "2.5rem",
            padding: "0.1rem 2.5rem 0.1rem 2.5rem",
          }}
        />
        <Button
          text={"NEXT"}
          textStyle={"labelText"}
          styles={{
            width: "auto",
            marginTop: "2.5rem",
            padding: "0.1rem 2.5rem 0.1rem 2.5rem",
          }}
        />
      </div>
    </div>
  );
}
