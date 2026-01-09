import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// Add NProgress styles
import "nprogress/nprogress.css"; 

import { AuthProvider } from "./context/AuthContext";
import { YearProvider } from "./context/YearContext";
import { LoadingProvider } from "./loading/LoadingContext"; // Import Provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoadingProvider> {/* Wrap App */}
      <AuthProvider>
        <YearProvider>
          <App />
        </YearProvider>
      </AuthProvider>
    </LoadingProvider>
  </React.StrictMode>
);