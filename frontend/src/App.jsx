import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CreateEmployeePage from './pages/CreateEmployeePage';
import DashboardPage from './pages/DashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeEditPage from './pages/EmployeeEditPage';
import AttendanceReportPage from './pages/AttendanceReportPage';
import LeaveManagementPage from './pages/LeaveManagementPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Smart Dashboard - shows different dashboard based on role
function SmartDashboard() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <DashboardPage /> : <EmployeeDashboardPage />;
}

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
            <SmartDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute requireAdmin>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute requireAdmin>
            <AttendanceReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave"
        element={
          <ProtectedRoute requireAdmin>
            <LeaveManagementPage />
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
        path="/admin/employees/:id"
        element={
          <ProtectedRoute requireAdmin>
            <EmployeeEditPage />
          </ProtectedRoute>
        }
      />

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
