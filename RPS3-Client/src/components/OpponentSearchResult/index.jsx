import { useState } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

export default function OpponentSearchResult() {
  const [isActive, setIsActive] = useState(false);
  const [currentColor, setCurrentColor] = useState("#626262");

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <p style={{ margin: "0rem" }} className="labelText">
        RESULT USER
      </p>
      <motion.button
        className="none"
        onClick={() => setIsActive((isActive) => !isActive)}
        whileTap={{ y: 5 }}
        whileHover={{ scale: 1.05 }}
      >
        <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.4999 28.4163C22.6336 28.4163 28.4166 22.6334 28.4166 15.4997C28.4166 8.366 22.6336 2.58301 15.4999 2.58301C8.36624 2.58301 2.58325 8.366 2.58325 15.4997C2.58325 22.6334 8.36624 28.4163 15.4999 28.4163Z"
            stroke={isActive ? "#007AFF" : currentColor}
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12.9166 10.333L20.6666 15.4997L12.9166 20.6663V10.333Z"
            stroke={isActive ? "#007AFF" : currentColor}
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </motion.button>
    </div>
  );
}
