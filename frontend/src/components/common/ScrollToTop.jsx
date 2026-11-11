import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useScrollToTop from "../../hooks/useScrollToTop";

/**
 * ScrollToTop Component
 * Displays a floating button to scroll back to the top of the page
 * Only shows when user has scrolled down
 * Also scrolls to top on route change
 */
const ScrollToTop = () => {
  const { isVisible, scrollToTop } = useScrollToTop(300);
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-50 p-4 bg-orange-600 text-white border-none rounded-full shadow-2xl cursor-pointer transition-all duration-300 hover:bg-orange-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-offset-2 md:bottom-8 md:right-8 md:p-3"
          aria-label="Scroll to top"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="md:w-5 md:h-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
