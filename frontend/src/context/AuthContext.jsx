// Provides React context and state hooks for authentication.
import { createContext, useContext, useState, useEffect } from 'react';
// Provides login and current-user API requests.
import { authAPI } from '../services/endpoints';

// Stores authentication values shared by all pages.
const AuthContext = createContext(null);

// Restores a saved session and exposes login, logout, and role flags.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });
  // Starts true so protected routes wait for saved-session restoration.
  const [loading, setLoading] = useState(true);

  // Sends credentials to the backend and stores the returned session.
  const login = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  };

  // Removes the local token and user profile to end the session.
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Verifies a saved token after a page refresh.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      authAPI.me().then(({ data }) => setUser(data)).catch(logout).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const isAdmin = user?.role === 'Admin';
  const isSales = user?.role === 'Sales';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSales }}>
      {children}
    </AuthContext.Provider>
  );
}

// Provides the authentication context to the calling component.
export const useAuth = () => useContext(AuthContext);
