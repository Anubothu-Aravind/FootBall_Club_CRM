import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

/**
 * SkeletonTable Component
 * Generic table skeleton with configurable rows and columns
 */
const SkeletonTable = ({ rows = 8, columns = 5, showHeader = true }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      {showHeader && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, i) => (
              <SkeletonText key={i} width="w-20" height="h-4" />
            ))}
          </div>
        </div>
      )}
      
      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="px-6 py-4"
            style={{ opacity: rowIndex % 2 === 0 ? 1 : 0.7 }}
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <SkeletonText 
                  key={colIndex} 
                  width={colIndex === 0 ? "w-32" : "w-20"} 
                  height="h-4" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;
