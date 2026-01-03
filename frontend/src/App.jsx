import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CreateEmployeePage from './pages/CreateEmployeePage';
import DashboardPage from './pages/DashboardPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/admin/create-employee"
        element={
          <ProtectedRoute requireAdmin>
            <CreateEmployeePage />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
