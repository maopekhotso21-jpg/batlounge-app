// Supplies redirects for protected and role-restricted routes.
import { Navigate, useLocation } from 'react-router-dom';
// Provides the current authenticated user and role.
import { useAuth } from '../context/AuthContext.jsx';

// Allows authenticated users through and redirects failed access checks.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Avoid redirecting before a saved token has been checked with the backend.
  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-gray-500">Loading session...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}