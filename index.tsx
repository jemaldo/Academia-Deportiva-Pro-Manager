
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// El polyfill de process ahora vive en index.html para cargarse primero.
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Error: No se encontró el elemento raíz 'root'.");
}
