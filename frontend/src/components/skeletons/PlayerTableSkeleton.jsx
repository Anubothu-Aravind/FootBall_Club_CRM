import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

/**
 * PlayerTableSkeleton Component
 * Skeleton loader for player management and players page tables
 */
const PlayerTableSkeleton = ({ rows = 10, showFilters = true }) => {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonBase key={i} className="w-32 h-10 rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            <SkeletonText width="w-24" height="h-4" />
            <SkeletonText width="w-16" height="h-4" />
            <SkeletonText width="w-20" height="h-4" />
            <SkeletonText width="w-16" height="h-4" />
            <SkeletonText width="w-24" height="h-4" />
            <SkeletonText width="w-20" height="h-4" />
          </div>
        </div>
        
        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="px-6 py-4" style={{ opacity: i % 2 === 0 ? 1 : 0.8 }}>
              <div className="grid grid-cols-6 gap-4 items-center">
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonText width="w-12" height="h-4" />
                <SkeletonText width="w-16" height="h-4" />
                <SkeletonText width="w-12" height="h-4" />
                <SkeletonText width="w-20" height="h-4" />
                <div className="flex gap-2">
                  <SkeletonBase className="w-8 h-8 rounded" />
                  <SkeletonBase className="w-8 h-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerTableSkeleton;
