import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext'; // 🌟 1. Import AuthProvider เข้ามา
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🌟 2. เอา AuthProvider มาครอบ App ไว้ */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);