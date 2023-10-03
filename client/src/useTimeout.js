import React, { useState, useEffect, useRef } from "react";

export const useTimeout = (fn, delay) => {
  const fnRef = useRef(null);

  //When ever function got updated this👇🏻useEffect will update fnRef
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  //When ever delay got updated this👇🏻useEffect will clear current one and create a new one with updated delay value
  useEffect(() => {
    const idx = setTimeout(fn, delay);

    return () => clearTimeout(idx);
  }, [delay]);

  return;
};
