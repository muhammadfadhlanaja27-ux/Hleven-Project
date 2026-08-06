import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Pastikan TailwindCSS sudah di-import di sini sesuai stack
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);