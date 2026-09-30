import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("TRAMA_CONTROL_CENTER_ROOT_MISSING");
}

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);


if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch((error) => {
      console.error("TRAMA_SERVICE_WORKER_REGISTRATION_FAILED", error);
    });
  });
}
