import { useState, useEffect } from 'react';

/**
 * useScrollToTop Hook
 * Custom hook that handles scroll-to-top functionality
 * Returns visibility state and scroll function
 */
const useScrollToTop = (threshold = 300) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down past threshold
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return { isVisible, scrollToTop };
};

export default useScrollToTop;
