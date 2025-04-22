import { useState, useEffect, useRef, cloneElement } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

export default function TextField({ text, textStyle, setDisplayState, destination, styles, focus }) {
  return (
    <input
      type="text"
      defaultValue={text}
      autoFocus={focus}
      required
      minlength="1"
      maxLength="16"
      className={textStyle}
      style={styles}
    ></input>
  );
}
