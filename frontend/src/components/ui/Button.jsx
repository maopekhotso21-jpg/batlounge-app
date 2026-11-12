// Renders a reusable Tailwind button with variants and loading state.
export default function Button({
  children, variant = 'primary', type = 'button',
  className = '', loading = false, ...props
}) {
  const map = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
  };
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`btn ${map[variant]} ${className}
        inline-flex items-center justify-center gap-2
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        active:translate-y-0 active:shadow-md
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}