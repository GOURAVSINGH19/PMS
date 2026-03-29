import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import CreateGoal from './pages/CreateGoal';
import GoalDetail from './pages/GoalDetail';
import Users from './pages/Users';
import Teams from './pages/Teams';
import Cycles from './pages/Cycles';
import PerformanceReview from './pages/PerformanceReview';
import FeedbackForm from './pages/FeedbackForm';
import Probation from './pages/Probation';
import Reports from './pages/Reports';
import FeedbackFlags from './pages/FeedbackFlags';
import Notifications from './pages/Notifications';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        
        {/* Protected Application Routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
        <Route path="/goals/new" element={<ProtectedRoute><Layout><CreateGoal /></Layout></ProtectedRoute>} />
        <Route path="/goals/:id" element={<ProtectedRoute><Layout><GoalDetail /></Layout></ProtectedRoute>} />
        
        <Route path="/users" element={<ProtectedRoute requireAdmin><Layout><Users /></Layout></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Layout><Teams /></Layout></ProtectedRoute>} />
        
        <Route path="/cycles" element={<ProtectedRoute><Layout><Cycles /></Layout></ProtectedRoute>} />
        <Route path="/probation" element={<ProtectedRoute><Layout><Probation /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/feedback-flags" element={<ProtectedRoute requireAdmin><Layout><FeedbackFlags /></Layout></ProtectedRoute>} />
        
        <Route path="/performance" element={<ProtectedRoute><Layout><PerformanceReview /></Layout></ProtectedRoute>} />
        <Route path="/performance/form/:id" element={<ProtectedRoute><Layout><FeedbackForm /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
