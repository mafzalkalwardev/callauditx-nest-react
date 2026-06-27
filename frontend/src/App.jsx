import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Client Pages
import { ClientDashboard } from './pages/client/Dashboard';
import { ClientUploads } from './pages/client/Uploads';
import { ClientCategories } from './pages/client/Categories';
import { ClientQuestions } from './pages/client/Questions';
import { ClientReviews } from './pages/client/Reviews';
import { ClientAnalytics } from './pages/client/Analytics';
import { ClientEarnings } from './pages/client/Earnings';
import { ClientSettings } from './pages/client/Settings';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminClients } from './pages/admin/Clients';
import { AdminUploads } from './pages/admin/Uploads';
import { AdminReviews } from './pages/admin/Reviews';
import { AdminFailedReviews } from './pages/admin/FailedReviews';
import { AdminSettings } from './pages/admin/Settings';

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

// Layout Shell for Authenticated Pages
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 transition-colors duration-300">
      <Sidebar />
      <Navbar />
      <main className="pl-72 pr-8 pt-24 pb-8 min-h-screen transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Client Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/uploads" element={<ClientUploads />} />
                <Route path="/categories" element={<ClientCategories />} />
                <Route path="/questions" element={<ClientQuestions />} />
                <Route path="/reviews" element={<ClientReviews />} />
                <Route path="/analytics" element={<ClientAnalytics />} />
                <Route path="/earnings" element={<ClientEarnings />} />
                <Route path="/settings" element={<ClientSettings />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/uploads" element={<AdminUploads />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/failed-reviews" element={<AdminFailedReviews />} />
                <Route path="/admin/accuracy" element={<ClientAnalytics />} /> {/* Uses client analytics dashboard for global */}
                <Route path="/admin/earnings" element={<ClientEarnings />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
