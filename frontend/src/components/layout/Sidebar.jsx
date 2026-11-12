// Supplies consistent vector icons for the navigation menu.
import {
  Apple, BarChart3, Boxes, ClipboardList, LayoutDashboard,
  Package, Store, Truck
} from 'lucide-react';
// Provides the current route and authenticated user role.
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Defines the pages and roles that may see each navigation item.
const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales'] },
  { to: '/fruits', label: 'Fruits', icon: Apple, roles: ['Admin'] },
  { to: '/box-sizes', label: 'Box Sizes', icon: Boxes, roles: ['Admin'] },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['Admin'] },
  { to: '/stock', label: 'Stock', icon: Package, roles: ['Admin'] },
  { to: '/vendors', label: 'Street Vendors', icon: Store, roles: ['Admin', 'Sales'] },
  { to: '/orders', label: 'Orders', icon: ClipboardList, roles: ['Admin', 'Sales'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin'] }
];

// Renders responsive navigation filtered by the authenticated user's role.
export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const items = NAV.filter(n => n.roles.includes(user?.role));

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in" onClick={onClose} />
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-brand-800 text-white
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-5 border-b border-brand-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500 grid place-items-center font-bold transition-transform duration-300 hover:scale-110">
            BF
          </div>
          <div>
            <p className="font-bold leading-tight">Batloung</p>
            <p className="text-xs text-brand-200">Distribution System</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 border-l-4 border-transparent px-3 py-2 rounded-lg text-sm
                 transition-all duration-200 ease-out
                 animate-slide-in-left
                 hover:translate-x-1
                 ${isActive
                    ? 'border-l-white bg-brand-600 font-semibold shadow-md'
                    : 'hover:bg-brand-700 text-brand-100'}`
              }
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-700 text-xs text-brand-200">
          © {new Date().getFullYear()} Batloung Fruits
        </div>
      </aside>
    </>
  );
}
