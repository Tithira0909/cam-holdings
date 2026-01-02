import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileText, Settings, LogOut, MessageSquare, Layers } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Services', icon: Layers, href: '/admin/services' },
    { name: 'Resources', icon: FileText, href: '/admin/resources' },
    { name: 'Projects', icon: Briefcase, href: '/admin/projects' },
    { name: 'Inquiries', icon: MessageSquare, href: '/admin/inquiries' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">CAM Admin</h1>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center space-x-3 p-3 rounded transition-colors ${path === item.href ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 w-full rounded hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
