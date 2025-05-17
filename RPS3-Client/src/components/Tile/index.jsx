import { useState, useEffect, useRef, cloneElement } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

export default function Tile({
  size,
  isActive = false,
  layoutId = undefined,
  initial = false,
  animate = false,
  exit = false,
  variants = false,
  whileHover = false,
  // transition = undefined,
  onClick = undefined,
  children,
}) {
  const tileSizes = {
    slim: "22.5rem",
    thick: "28rem",
    height: "35rem",
  };

  const tileBorders = {
    width: "0.6rem",
    radius: "1rem",
    style: "solid",
    color: { default: "#b1b1b1", active: "#626262" },
  };

  function getTileStyle(size, active) {
    if (size !== "slim" && size !== "thick") {
      // console.log(size);
      throw Error();
    }
    const style = {
      height: tileSizes.height,
      borderStyle: tileBorders.style,
      borderWidth: tileBorders.width,
      borderRadius: tileBorders.radius,
      backgroundColor: "white",
    };
    // console.log(active);
    style.width = tileSizes[size];
    if (active) {
      style.borderColor = tileBorders.color.active;
    } else {
      // console.log("test");
      style.borderColor = tileBorders.color.default;
    }
    // console.log(style);
    return style;
  }

  return (
    <motion.div
      layoutId={layoutId}
      initial={initial}
      animate={animate}
      exit={exit}
      variants={variants}
      whileHover={whileHover}
      // transition={transition}
      onClick={onClick}
      style={{
        ...getTileStyle(size, isActive),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // position: "absolute",
      }}
    >
      {children}
    </motion.div>
  );
}
