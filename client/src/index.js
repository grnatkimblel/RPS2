import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

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

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
