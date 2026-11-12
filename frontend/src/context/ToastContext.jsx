// Provides React context and hooks for notification state.
import { createContext, useContext, useState, useCallback } from 'react';

// Stores notification functions used by forms and pages.
const ToastContext = createContext(null);

// Renders child content and temporary success/error/info messages.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Adds a notification and removes it after the requested timeout.
  const push = useCallback((message, type = 'success', timeout = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  }, []);

  // Creates a success notification.
  const success = (m) => push(m, 'success');
  // Creates an error notification.
  const error = (m) => push(m, 'error');
  // Creates an informational notification.
  const info = (m) => push(m, 'info');

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white min-w-[260px] animate-[slideIn_.25s_ease] ${
              t.type === 'success' ? 'bg-brand-600' :
              t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </ToastContext.Provider>
  );
}

// Provides toast operations to the calling component.
export const useToast = () => useContext(ToastContext);