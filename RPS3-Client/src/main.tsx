import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig transition={{ type: "spring", stiffness: 50, damping: 20, duration: 0.5 }}>
      <App />
    </MotionConfig>
  </StrictMode>
);
