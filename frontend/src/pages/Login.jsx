import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, User } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use full URL or setup proxy. Assuming localhost:5000 for backend
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        type: activeTab
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
           <h2 className="text-2xl font-bold text-primary">CAM Portal</h2>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 pb-2 text-center font-medium ${activeTab === 'admin' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Login
          </button>
          <button
            className={`flex-1 pb-2 text-center font-medium ${activeTab === 'client' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('client')}
          >
            Client Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded focus:outline-none focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white p-2 rounded hover:bg-gray-800 transition-colors"
          >
            {activeTab === 'admin' ? 'Login as Admin' : 'Login as Client'}
          </button>
        </form>

        <div className="mt-4 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-primary">Back to Website</a>
        </div>
      </div>
    </div>
  );
}
