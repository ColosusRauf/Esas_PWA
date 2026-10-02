import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./theme.jsx";
import { LangProvider } from "./i18n.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ThemeProvider>
      <LangProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LangProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
