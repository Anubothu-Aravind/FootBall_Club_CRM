import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Modern SaaS-style header for Players directory
 * Follows Law of Proximity and Fitts's Law
 */
const PlayersHeroBanner = ({ playerCount }) => {
  const { coach } = useAuth();

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6 max-md:px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">
              Player Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Meet our talented athletes across all age groups
            </p>
          </div>

          {/* Desktop: Right-aligned Add Button */}
          {coach && (
            <Link
              to="/manage-players"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm hover:shadow-md no-underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Player
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayersHeroBanner;
