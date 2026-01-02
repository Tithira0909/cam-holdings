import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-gray-50">
        <header className="bg-white shadow p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
            <a href="/" target="_blank" className="text-primary hover:underline">Visit Site</a>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
