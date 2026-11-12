// Provides the fallback navigation link.
import { Link } from 'react-router-dom';
// Provides a professional not-found illustration.
import { Compass } from 'lucide-react';

// Handles unknown frontend URLs with a link back to the application.
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md text-center">
        <Compass size={48} className="mb-3 text-brand-600" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">404 — Page Not Found</h1>
        <p className="text-sm text-gray-500 mb-4">
          The page you are looking for does not exist.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
}