import { Outlet, useNavigate } from 'react-router-dom';

export default function ClientLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">CAM Client Portal</h1>
            <div className="flex gap-4">
                <a href="/" className="text-gray-600 hover:text-primary pt-1">Visit Site</a>
                <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
            </div>
        </div>
      </header>
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
