import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToPortal from "../components/dashboard/BackToPortal";
import JerseyLikesAnalytics from "../components/dashboard/JerseyLikesAnalytics";

/**
 * Jersey Likes Management Page
 * Admin and Super Admin can view analytics and manage jersey likes
 */
const JerseyLikesManagement = () => {
  const { coach, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!coach || (coach.role !== "ADMIN" && coach.role !== "SUPER_ADMIN")) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Jersey Likes Management
            </h1>
            <p className="text-gray-600">
              View analytics and manage jersey likes from the About page
            </p>
          </div>
          <BackToPortal />
        </div>

        {/* Analytics Component */}
        <JerseyLikesAnalytics />
      </div>
    </DashboardLayout>
  );
};

export default JerseyLikesManagement;
