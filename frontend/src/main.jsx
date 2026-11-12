// Provides React's development checks and lifecycle behavior.
import React from 'react';
// Mounts the React component tree into the HTML root element.
import ReactDOM from 'react-dom/client';
// Enables client-side navigation without full page reloads.
import { BrowserRouter } from 'react-router-dom';
// Provides the route tree and application shell.
import App from './App.jsx';
// Provides authentication state to every page.
import { AuthProvider } from './context/AuthContext.jsx';
// Provides success, error, and information notifications.
import { ToastProvider } from './context/ToastContext.jsx';
// Loads Tailwind directives and shared visual styles.
import './index.css';

// Mounts the application with routing, notifications, and authentication contexts.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);

