// Renders a labeled text input and an optional validation message.
export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`${className} ${error ? 'animate-shake' : ''}`}>
      {label && <label className="label">{label}</label>}
      <input
        className={`input transition-all duration-200 ease-out
          ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:shadow-md'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
