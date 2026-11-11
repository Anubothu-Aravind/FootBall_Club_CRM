import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

/**
 * SkeletonStats Component
 * Stat card skeleton for dashboard metrics
 */
const SkeletonStats = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <SkeletonText width="w-16" height="h-8" className="mb-2" />
          <SkeletonText width="w-24" height="h-4" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonStats;
