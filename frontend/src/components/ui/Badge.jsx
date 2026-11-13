// Renders compact status or category text using the shared badge style.
export default function Badge({ children, className = '' }) {
  return <span className={`badge ${className}`}>{children}</span>;
}
