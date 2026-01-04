import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiLogin } from '../../lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiLogin(username, password);
      // Expecting { token, user } or similar structure
      const { token, user } = response.data;
      if (token) {
        // If user object isn't returned, we mock it or fetch it
        const userObj = user || { id: '1', username: username, role: 'ADMIN' };
        login(token, userObj);
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
        console.error("Login error", err);
        if (err.response) {
             setError(err.response.data.message || 'Login failed');
        } else {
             setError('Connection failed. Please check your network or server status.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
                CAM <span className="text-[#D6B25E]">Admin</span>
            </h1>
            <p className="text-gray-400">Sign in to manage the platform</p>
        </div>

        <div className="bg-[#111111] p-8 rounded-xl border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-[#D6B25E] text-white placeholder-gray-600 transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-[#D6B25E] text-white placeholder-gray-600 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D6B25E] hover:bg-[#C5A24E] text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-[#D6B25E] transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
