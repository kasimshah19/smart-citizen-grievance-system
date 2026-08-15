import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { registerSW } from "virtual:pwa-register";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

// Use Vite PWA virtual module for robust registration and auto-updates
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: Prompt user to refresh the app if there's a new version
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
  },
});