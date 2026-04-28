import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply persisted theme before first paint to avoid a flash of light theme.
const persisted = localStorage.getItem("lumina-theme");
try {
  const theme = persisted ? JSON.parse(persisted)?.state?.theme : "dark";
  if (theme === "dark") document.documentElement.classList.add("dark");
} catch {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
