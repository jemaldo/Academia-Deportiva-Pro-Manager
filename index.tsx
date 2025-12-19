
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Polyfill básico para evitar errores de 'process is not defined' en el navegador
(window as any).process = (window as any).process || { env: { API_KEY: '' } };

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registrado con éxito:', registration.scope);
      })
      .catch(error => {
        console.log('Fallo en registro de SW:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
