// Renders a consistent inline loading indicator and label.
export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
      <svg className="animate-spin h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25" />
        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
