import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import SmoothScrolling from "./animations/SmoothScrolling.jsx";
import { Provider } from "react-redux";
import { store } from "./app/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SmoothScrolling>
          <App />
        </SmoothScrolling>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
