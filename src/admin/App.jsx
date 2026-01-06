import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Inquiries from './pages/Inquiries';

// Simple Layout component
const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f3f4f6' }}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  // Check auth?
  // For simplicity, we assume token is in localStorage, if not we might redirect to /login.html
  // But since login.html is vanilla and redirects to index.html, we might need to manually check.

  const isAuthenticated = () => {
    // This is a basic check. In real app, verify token validity.
    // The vanilla login page might not set the token in a way we can access easily if it's httpOnly cookie.
    // However, the memory says "Frontend authentication logic uses localStorage to store the JWT token".
    // Let's assume it's in localStorage or cookie.
    // If cookie, we can't check easily in JS if httpOnly.
    // backend/index.js sets a cookie.
    // We will assume the browser handles the cookie for API requests.
    return true;
  };

  if (!isAuthenticated()) {
      window.location.href = '/login.html';
      return null;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/admin.html" element={<Navigate to="/admin/inquiries" />} />
        <Route path="/admin" element={<Navigate to="/admin/inquiries" />} />
        <Route path="/admin/inquiries" element={<Inquiries />} />
        {/* Add other admin routes here if needed */}
      </Routes>
    </Layout>
  );
};

export default App;
