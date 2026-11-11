import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

/**
 * AuditLogsSkeleton Component
 * Skeleton for audit logs table with badges and filters
 */
const AuditLogsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <SkeletonText width="w-24" height="h-5" className="mb-2" />
            <SkeletonText width="w-16" height="h-8" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonBase key={i} className="w-32 h-10 rounded" />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonText key={i} width="w-20" height="h-4" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonBase className="w-16 h-6 rounded-full" />
                <SkeletonText width="w-24" height="h-4" />
                <SkeletonText width="w-20" height="h-4" />
                <SkeletonText width="w-28" height="h-4" />
                <SkeletonBase className="w-20 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsSkeleton;
