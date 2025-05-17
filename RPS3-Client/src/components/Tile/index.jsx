import { useState, useEffect, useRef, cloneElement } from "react";
import { motion, steps } from "motion/react";
import "../../styles/styles.css";

export default function Tile({
  size,
  // isActive = false,
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
    color: "var(--tileBorderColor_Active)",
  };

  function getTileStyle(size) {
    if (size !== "slim" && size !== "thick") {
      // console.log(size);
      throw Error();
    }
    const style = {
      height: tileSizes.height,
      borderStyle: tileBorders.style,
      borderWidth: tileBorders.width,
      borderRadius: tileBorders.radius,
      backgroundColor: "var(--backgroundColor)",
    };
    // console.log(active);
    style.width = tileSizes[size];
    style.borderColor = tileBorders.color;

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
        ...getTileStyle(size),
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
