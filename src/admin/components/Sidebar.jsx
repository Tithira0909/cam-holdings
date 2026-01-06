import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Projects', path: '/admin/projects' },
    { label: 'All Inquiries', path: '/admin/inquiries' },
    { label: 'Reviews', path: '/admin/reviews' },
  ];

  const sidebarStyle = {
    width: '250px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px'
  };

  const itemStyle = (isActive) => ({
    display: 'block',
    padding: '10px 15px',
    marginBottom: '5px',
    borderRadius: '6px',
    textDecoration: 'none',
    color: isActive ? '#fff' : '#374151',
    backgroundColor: isActive ? '#0f172a' : 'transparent',
    fontWeight: isActive ? '600' : '400',
    cursor: 'pointer'
  });

  return (
    <div style={sidebarStyle}>
      <h2 style={{ marginBottom: '30px', color: '#111827', fontSize: '1.25rem', fontWeight: 'bold' }}>Admin</h2>
      <nav>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={itemStyle(isActive)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
