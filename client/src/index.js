import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, MemoryRouter, Router, RouterProvider } from "react-router-dom";
import "./index.css";
import AppV1 from "./AppV1";
import ErrorPage from "./routes/error-page";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MemoryRouter>
      <AppV1 />
    </MemoryRouter>
  </React.StrictMode>
);

async function ping() {
  let start = Date.now();
  const response = await fetch("http://localhost:8080/ping");
  let end = Date.now();
  let timeElapsed = end - start;
  const json = await response.json();
  let RTT = json.requestReceived - start;
  console.log("TimeElapsed");
  console.log(timeElapsed);
  console.log("RTT");
  console.log(RTT);
  console.log("Fetch Body");
  console.log(json);
}
