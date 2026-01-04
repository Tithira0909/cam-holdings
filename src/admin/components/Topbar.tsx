import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Dashboard';
    const segment = path.split('/')[2];
    if (!segment) return 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#070708] border-b border-white/10">
      <h1 className="text-xl font-semibold text-white capitalize">
        {getPageTitle(location.pathname)}
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
           {user?.username || 'Admin'}
        </span>
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
