import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaExternalLinkAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center h-16">
      <div className="flex items-center">
        <a
          href="http://localhost:5173" // Assuming main site runs here
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FaExternalLinkAlt className="mr-2" />
          Visit Site
        </a>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-gray-700">
          <FaUserCircle className="text-2xl mr-2" />
          <span className="font-semibold">{user?.name}</span>
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center text-red-600 hover:text-red-800 font-medium"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
