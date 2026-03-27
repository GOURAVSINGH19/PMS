import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import GoalListPage from './pages/Goals/GoalListPage';
import ProbationPage from './pages/Probation/ProbationPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes inside AppLayout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="goals" element={<GoalListPage />} />
            <Route path="probation" element={<ProbationPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            {/* Fallback */}
            <Route path="*" element={<div className="empty-state">Page not found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
