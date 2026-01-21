import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Components
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminServices from './pages/admin/Services';
import AdminResources from './pages/admin/Resources';
import AdminProjects from './pages/admin/Projects';
import AdminReviews from './pages/admin/Reviews';
import AdminInquiries from './pages/admin/Inquiries';
import AdminQuotations from './pages/admin/Quotations';

// Admin Settings Components
import AdminSiteSettings from './pages/admin/settings/Site';
import AdminAnalyticsSettings from './pages/admin/settings/Analytics';
import AdminEmailSettings from './pages/admin/settings/Email';
import AdminPermissionsSettings from './pages/admin/settings/Permissions';

// Client Components (Keeping existing placeholders)
import ClientDashboard from './pages/client/Dashboard';
import ClientLayout from './layouts/ClientLayout';
import Login from './pages/Login'; // Existing general login, maybe unused now for admin?

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Existing Login - Keeping it if used by Client area, or just fallback */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="quotations" element={<AdminQuotations />} />

            <Route path="settings/site" element={<AdminSiteSettings />} />
            <Route path="settings/analytics" element={<AdminAnalyticsSettings />} />
            <Route path="settings/email" element={<AdminEmailSettings />} />
            <Route path="settings/permissions" element={<AdminPermissionsSettings />} />
          </Route>

          {/* Client Routes - Leaving as is but wrapping in potential future guard if needed */}
          <Route path="/client" element={<ClientLayout />}>
            <Route path="dashboard" element={<ClientDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
