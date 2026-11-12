// Renders one dashboard metric with an icon and color variant.
export default function StatCard({ title, value, icon, color = 'brand', description = '' }) {
  const colors = {
    brand: 'bg-brand-100 text-brand-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
    pink: 'bg-pink-100 text-pink-700',
    lime: 'bg-lime-100 text-lime-800'
  };
  return (
    <div
      className="card group flex min-h-28 items-center gap-3 border border-gray-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md sm:gap-4 sm:p-5"
      title={description ? `${title}: ${description}` : title}
      aria-label={`${title}: ${value}${description ? `. ${description}` : ''}`}
    >
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl transition-transform duration-200 group-hover:rotate-3 group-hover:scale-110 sm:h-12 sm:w-12 ${colors[color] || colors.brand}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-500">{title}</p>
        <p className="truncate text-xl font-bold text-gray-800 sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}