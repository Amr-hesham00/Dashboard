import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, nonAdminOnly = false }) {
  const { isAuthenticated, isAdmin, initialLoading } = useAuth();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-body">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Authenticating session...</span>
          </div>
          <div className="small text-secondary mt-3 fw-medium">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/pages/authentication/sign-in" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Non-admin users are not permitted to access admin-only routes
    return <Navigate to="/" replace />;
  }

  if (nonAdminOnly && isAdmin) {
    // Admin users only access Admin Management
    return <Navigate to="/admin" replace />;
  }

  return children;
}


