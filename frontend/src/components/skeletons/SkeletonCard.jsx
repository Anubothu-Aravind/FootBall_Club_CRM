import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

/**
 * SkeletonCard Component
 * Card-style skeleton for dashboard widgets and content cards
 */
const SkeletonCard = ({ height = "h-32", showHeader = true, lines = 3 }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${height}`}>
      {showHeader && (
        <SkeletonText width="w-3/4" height="h-6" className="mb-4" />
      )}
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <SkeletonText 
            key={i} 
            width={i === lines - 1 ? "w-2/3" : "w-full"} 
            height="h-4" 
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
