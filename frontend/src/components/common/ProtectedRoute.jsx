import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * Wraps a page component and redirects to /login if the user is not authenticated.
 * Preserves the intended destination so the user is sent there after login.
 *
 * Usage:
 *   <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
 *
 * Props:
 *   children – the page component to render when authorised
 *   requiredRole – (optional) restrict to a specific role, e.g. "SUPER_ADMIN"
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, coach, loading } = useAuth();
  const location = useLocation();

  // While we're still restoring a session from localStorage, show nothing
  // (prevents a flash of the login page on hard-refresh)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → send to login, remember where they wanted to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but wrong role → send to home with a subtle redirect
  if (requiredRole && coach?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
