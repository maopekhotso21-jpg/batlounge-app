// Provides a consistent vector search icon.
import { Search } from 'lucide-react';

// Renders a controlled search input with an accessible label.
export default function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} aria-hidden="true" />
      <input
        className="input pl-9"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}