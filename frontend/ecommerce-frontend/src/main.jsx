import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { BackendStatusProvider } from "./context/BackendStatusContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BackendStatusProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </BackendStatusProvider>
  </React.StrictMode>
);
