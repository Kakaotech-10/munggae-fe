import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import favicon from "./image/logo_black.png";

// Dynamically set favicon
const link = document.createElement("link");
link.type = "image/png";
link.rel = "icon";
link.href = favicon;
document.head.appendChild(link);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
