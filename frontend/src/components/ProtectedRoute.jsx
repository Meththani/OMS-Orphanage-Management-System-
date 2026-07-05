import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage: <ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
