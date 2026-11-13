// Renders the shared empty result state when a table has no rows.
import EmptyState from './EmptyState.jsx';

// Renders a reusable table with loading, empty, and column states.
export default function Table({ columns, rows, loading, emptyMessage = 'No records found' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 text-left font-semibold text-gray-600 ${c.className || ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="p-6 text-center text-gray-500">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="p-6">
              <EmptyState message={emptyMessage} />
            </td></tr>
          ) : rows.map((r, i) => (
            <tr key={r.id ?? i} className="border-b last:border-0 hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
