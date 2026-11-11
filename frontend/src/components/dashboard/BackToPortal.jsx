import { Link } from "react-router-dom";

/**
 * BackToPortal Component
 * Consistent "← Back to Coach Portal" link used across all management pages.
 * Navigates to Coach Portal with optional tab state for deep linking.
 */
const BackToPortal = ({ tab = "management-hub" }) => (
  <Link
    to="/coach-portal"
    state={{ tab }}
    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors mb-4 no-underline group max-[480px]:text-xs max-[480px]:mb-3"
  >
    <svg
      className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform max-[480px]:w-3.5 max-[480px]:h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
    Back to Coach Portal
  </Link>
);

export default BackToPortal;
