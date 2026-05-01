import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";

// Estilos globales
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: #F5F3F0;
    color: #2C2C2A;
  }
  
  input, select, textarea {
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement("style");
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

// Renderizar la app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
