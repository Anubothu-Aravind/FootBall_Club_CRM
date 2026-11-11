import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';
import SkeletonCard from './SkeletonCard';

/**
 * DashboardSkeleton Component
 * Skeleton for Coach Portal dashboard with analytics cards
 */
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <SkeletonText width="w-64" height="h-8" className="mb-2" />
          <SkeletonText width="w-48" height="h-5" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <SkeletonText width="w-32" height="h-5" className="mb-3" />
              <SkeletonText width="w-20" height="h-10" className="mb-4" />
              <div className="space-y-2">
                <SkeletonText width="w-full" height="h-3" />
                <SkeletonText width="w-5/6" height="h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SkeletonText width="w-32" height="h-6" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonBase key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
