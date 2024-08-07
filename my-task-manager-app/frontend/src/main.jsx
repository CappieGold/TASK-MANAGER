import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './pages/LoginPage.css';
import './components/Footer.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
