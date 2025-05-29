import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";

import AppController from "./AppController.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <MotionConfig transition={{ type: "spring", stiffness: 50, damping: 20, duration: 5 }}> */}
    <AppController />
    {/* </MotionConfig> */}
  </StrictMode>
);
