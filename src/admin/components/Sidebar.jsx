import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/quotations', label: 'Quotations' },
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 border-r border-accent/20">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-accent">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-6 py-3 hover:bg-gray-800 transition-colors ${
              location.pathname === item.path ? 'text-accent border-r-4 border-accent' : 'text-gray-400'
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full text-left px-6 py-3 text-red-400 hover:bg-gray-800 transition-colors mt-auto"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
