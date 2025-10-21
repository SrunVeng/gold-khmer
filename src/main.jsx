import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "../src/locales/i18n.js";

// ⬇️ add these two imports
import { ToastProvider } from "./components/Toast.jsx";
import { ConfirmProvider } from "./components/ConfirmGuard.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ToastProvider>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </ToastProvider>
    </StrictMode>
);
