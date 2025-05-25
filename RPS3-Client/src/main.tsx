import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import Old from "./Old.tsx";
import Test from "./Test.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <MotionConfig transition={{ type: "spring", stiffness: 50, damping: 20, duration: 5 }}> */}
    <App />
    {/* </MotionConfig> */}
  </StrictMode>
);
