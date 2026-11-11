import SkeletonBase from './SkeletonBase';

/**
 * SkeletonText Component
 * Text placeholder with configurable width
 */
const SkeletonText = ({ width = "w-full", height = "h-4", className = "" }) => {
  return (
    <SkeletonBase className={`${width} ${height} ${className}`} />
  );
};

export default SkeletonText;
