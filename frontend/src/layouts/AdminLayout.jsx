import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  FolderKanban,
  Star,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toggle Settings submenu if we are in a settings route
  React.useEffect(() => {
    if (location.pathname.startsWith('/admin/settings')) {
      setIsSettingsOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Resources', path: '/admin/resources', icon: FileText },
    { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { name: 'Customer Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Customer Quotations', path: '/admin/quotations', icon: FileSpreadsheet },
  ];

  const settingsItems = [
    { name: 'Permission Settings', path: '/admin/settings/permissions' },
    { name: 'Analytics Settings', path: '/admin/settings/analytics' },
    { name: 'Site Settings', path: '/admin/settings/site' },
    { name: 'Email Settings', path: '/admin/settings/email' },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-black border-r border-neutral-800 transition-all duration-300 flex flex-col fixed h-full z-20 md:relative`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
          {isSidebarOpen && <span className="text-xl font-bold text-amber-500 tracking-wider">CAM ADMIN</span>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded hover:bg-neutral-800 text-gray-400"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-700">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'} // Only exact match for dashboard home
              className={({ isActive }) => `
                flex items-center px-3 py-2 rounded-md transition-colors duration-200
                ${isActive
                  ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500'
                  : 'text-gray-400 hover:bg-neutral-800 hover:text-white'
                }
              `}
            >
              <item.icon size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}

          {/* Settings Submenu */}
          <div className="pt-2">
             <button
              onClick={() => setIsSidebarOpen(true) && setIsSettingsOpen(!isSettingsOpen) || setIsSettingsOpen(!isSettingsOpen)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-200 text-gray-400 hover:bg-neutral-800 hover:text-white
                ${location.pathname.startsWith('/admin/settings') ? 'text-amber-500' : ''}
              `}
            >
              <div className="flex items-center">
                <Settings size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
                {isSidebarOpen && <span>Settings</span>}
              </div>
              {isSidebarOpen && (
                isSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </button>

            {isSidebarOpen && isSettingsOpen && (
              <div className="ml-9 mt-1 space-y-1 border-l border-neutral-800 pl-2">
                {settingsItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      block px-3 py-2 rounded-md text-sm transition-colors duration-200
                      ${isActive
                        ? 'text-amber-500 bg-neutral-800/50'
                        : 'text-gray-500 hover:text-white hover:bg-neutral-800'
                      }
                    `}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-full"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Topbar */}
        <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-white capitalize">
            {location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            {/* Add more topbar items if needed, e.g. notifications */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-neutral-900">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
