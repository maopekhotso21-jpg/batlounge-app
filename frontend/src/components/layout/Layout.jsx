// Manages responsive sidebar state.
import { useState } from 'react';
// Renders the currently matched child route.
import { Outlet } from 'react-router-dom';
// Provides desktop/mobile navigation.
import Sidebar from './Sidebar.jsx';
// Provides the account header and mobile menu button.
import Topbar from './Topbar.jsx';

// Renders the protected application shell around every feature page.
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
