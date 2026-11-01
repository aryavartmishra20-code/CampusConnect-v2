import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

// Entry point for standard React tooling
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
