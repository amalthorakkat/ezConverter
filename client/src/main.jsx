import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import SmoothScrolling from "./animations/SmoothScrolling.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScrolling>
        <App />
      </SmoothScrolling>
    </BrowserRouter>
  </StrictMode>,
);
