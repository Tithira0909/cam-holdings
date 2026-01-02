import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaUsers, FaTools, FaProjectDiagram, FaFileAlt,
  FaStar, FaEnvelope, FaFileInvoiceDollar, FaCog, FaSlidersH
} from 'react-icons/fa';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <FaHome /> },
    { label: 'Users', path: '/users', icon: <FaUsers /> },
    { label: 'Services', path: '/services', icon: <FaTools /> },
    { label: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },
    { label: 'Resources', path: '/resources', icon: <FaFileAlt /> },
    { label: 'Customer Reviews', path: '/reviews', icon: <FaStar /> },
    { label: 'Inquiries', path: '/inquiries', icon: <FaEnvelope /> },
    { label: 'Customer Quotations', path: '/quotations', icon: <FaFileInvoiceDollar /> },
    { label: 'Quotation Settings', path: '/quotation-settings', icon: <FaSlidersH /> },
    { label: 'Settings', path: '/settings', icon: <FaCog /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        CAM Admin
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={clsx(
                  "flex items-center p-3 rounded hover:bg-gray-800 transition-colors",
                  location.pathname === item.path && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        &copy; 2024 CAM Holdings
      </div>
    </div>
  );
};

export default Sidebar;
