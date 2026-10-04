import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && (!user || user.role !== "admin")) {
    return <Navigate to="/products" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/products" replace />;
  }

  return children;
}

export default ProtectedRoute
