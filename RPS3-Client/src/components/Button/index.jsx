import { useState, useEffect, useRef, cloneElement } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

export default function Button({ text, textStyle, setDisplayState, destination, styles, onClick }) {
  return (
    <motion.button //Play Button
      transition={{ duration: 0.05 }}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{ y: 5 }}
      onClick={
        onClick
          ? onClick
          : (event) => {
              event.stopPropagation();
              setDisplayState(destination);
            }
      }
      style={{ width: "100%", ...styles }}
      className={textStyle}
    >
      {text}
    </motion.button>
  );
}
