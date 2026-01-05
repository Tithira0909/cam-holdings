import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Blogs from './pages/Blogs';
import Quotations from './pages/Quotations';
import Sidebar from './components/Sidebar';
import axios from 'axios';

// Layout component for authenticated pages
const AdminLayout = () => (
  <div className="flex min-h-screen bg-primary text-white">
    <Sidebar />
    <div className="flex-1 p-8 ml-64">
      <Outlet />
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check auth status
    axios.get('/api/check-auth')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
};

const App = () => {
  return (
    <Router basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="quotations" element={<Quotations />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
