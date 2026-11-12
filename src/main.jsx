import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import SmoothScroll from "./components/SmoothScroll.jsx";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <SmoothScroll />
      <App />
    </BrowserRouter>
  </StrictMode>
);