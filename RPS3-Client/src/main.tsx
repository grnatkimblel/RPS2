import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.tsx";
import Test from "./Test.tsx"
import Test2 from "./Test2.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig transition={{ type: "spring", stiffness: 50, damping: 20, duration: 0.2 }}>
      <Test2 />
    </MotionConfig>
  </StrictMode>
);
