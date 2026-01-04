import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/Placeholder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<PlaceholderPage title="User Management" />} />
            <Route path="services" element={<PlaceholderPage title="Services Management" />} />
            <Route path="resources" element={<PlaceholderPage title="Resources" />} />
            <Route path="projects" element={<PlaceholderPage title="Projects" />} />
            <Route path="reviews" element={<PlaceholderPage title="Customer Reviews" />} />
            <Route path="inquiries" element={<PlaceholderPage title="Inquiries" />} />
            <Route path="quotations" element={<PlaceholderPage title="Quotations" />} />

            <Route path="settings/site" element={<PlaceholderPage title="Site Settings" />} />
            <Route path="settings/analytics" element={<PlaceholderPage title="Analytics Settings" />} />
            <Route path="settings/email" element={<PlaceholderPage title="Email Settings" />} />
            <Route path="settings/permissions" element={<PlaceholderPage title="Permission Settings" />} />
          </Route>

          {/* Fallback for unknown admin routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
