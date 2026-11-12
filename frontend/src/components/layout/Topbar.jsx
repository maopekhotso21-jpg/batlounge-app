// Provides familiar symbols for the mobile menu and logout action.
import { LogOut, Menu } from 'lucide-react';
// Provides the authenticated user and logout operation.
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// Renders the application header and responsive account controls.
export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Clears authentication state before returning the user to the login page.
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Batloung Distribution Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white grid place-items-center font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <button onClick={handleLogout} className="btn btn-ghost text-sm" title="Log out">
            <LogOut size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}