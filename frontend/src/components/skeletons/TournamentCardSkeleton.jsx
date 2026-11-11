import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

/**
 * TournamentCardSkeleton Component
 * Skeleton for tournament cards on home page and management
 */
const TournamentCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Badge */}
          <SkeletonBase className="w-20 h-6 rounded-full mb-3" />
          
          {/* Title */}
          <SkeletonText width="w-3/4" height="h-6" className="mb-3" />
          
          {/* Details */}
          <div className="space-y-2 mb-4">
            <SkeletonText width="w-full" height="h-4" />
            <SkeletonText width="w-5/6" height="h-4" />
            <SkeletonText width="w-4/6" height="h-4" />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <SkeletonBase className="flex-1 h-10 rounded" />
            <SkeletonBase className="w-10 h-10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentCardSkeleton;
