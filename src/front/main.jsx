import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from './hooks/useGlobalReducer';
import { BackendURL } from './components/BackendURL';

const Main = () => {
    // Siempre usar VITE_BACKEND_URL, nunca proxy
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl || backendUrl === "") return (
        <React.StrictMode>
            <BackendURL />
        </React.StrictMode>
    );
    return (
        <React.StrictMode>
            <StoreProvider>
                <RouterProvider router={router} />
            </StoreProvider>
        </React.StrictMode>
    );
}

// Renderiza solo una vez el componente raíz
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Main />);
