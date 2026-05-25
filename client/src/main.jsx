import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TripProvider } from "./context/TripContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              },
              success: {
                iconTheme: { primary: "#10B981", secondary: "white" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "white" },
              },
            }}
          />
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
