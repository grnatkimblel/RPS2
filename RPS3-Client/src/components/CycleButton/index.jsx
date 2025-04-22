import { useState, useEffect, useRef, cloneElement } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

export default function CycleButton({ options, setDisplayState, textStyle, styles }) {
  const [index, setIndex] = useState(0);
  const text = options[index];

  return (
    <motion.button //Play Button
      transition={{ duration: 0.05 }}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{ y: 5 }}
      onClick={(event) => {
        event.stopPropagation();
        setIndex((prev) => {
          return prev + 1 === options.length ? 0 : prev + 1;
        });
      }}
      style={{ width: "100%", ...styles }}
      className={textStyle}
    >
      {text}
    </motion.button>
  );
}
