/**
 * SkeletonBase Component
 * Base wrapper for skeleton loading animations
 * Provides shimmer effect animation
 */
const SkeletonBase = ({ className = "", children, variant = "shimmer" }) => {
  const baseClasses = "bg-gray-200 rounded";
  
  const animationClasses = {
    shimmer: "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
    pulse: "animate-pulse",
  };

  return (
    <div 
      className={`${baseClasses} ${animationClasses[variant]} ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      {children}
    </div>
  );
};

export default SkeletonBase;
