import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
