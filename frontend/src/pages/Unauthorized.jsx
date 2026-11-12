// Provides the fallback navigation link.
import { Link } from 'react-router-dom';
// Provides a professional access-denied illustration.
import { ShieldAlert } from 'lucide-react';

// Explains a role-based access denial and links back to the dashboard.
export default function Unauthorized() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-md text-center">
        <ShieldAlert size={48} className="mb-3 text-red-500" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">403 — Unauthorized</h1>
        <p className="text-sm text-gray-500 mb-4">
          You do not have permission to view this page.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
}