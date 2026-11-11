/**
 * Training Card Skeleton Loader
 * Displays a skeleton UI while training data is loading
 */
const TrainingCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-6 max-md:p-5 max-[480px]:p-4 animate-pulse"
        >
          {/* Badges */}
          <div className="mb-4 flex gap-2">
            <div className="h-7 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-7 w-24 bg-gray-200 rounded-full"></div>
          </div>

          {/* Title */}
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

          {/* Details */}
          <div className="flex flex-col gap-3">
            {/* Age Group */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Coach */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainingCardSkeleton;
