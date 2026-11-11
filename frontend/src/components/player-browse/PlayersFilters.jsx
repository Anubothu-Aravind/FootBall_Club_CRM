import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Modern structured filters following Jakob's Law
 * Search + Dropdowns + Clear Filters
 */
const PlayersFilters = ({
  ageGroups,
  selectedAgeGroup,
  setSelectedAgeGroup,
  selectedGender,
  setSelectedGender,
  searchTerm,
  setSearchTerm,
  filteredCount,
}) => {
  const { coach } = useAuth();
  const hasActiveFilters =
    selectedAgeGroup !== "All" || selectedGender !== "All" || searchTerm;

  const clearFilters = () => {
    setSelectedAgeGroup("All");
    setSelectedGender("All");
    setSearchTerm("");
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 max-md:px-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search players by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Age Group Dropdown */}
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer sm:w-auto w-full"
          >
            <option value="All">All Age Groups</option>
            {ageGroups.map((ag) => (
              <option key={ag} value={ag}>
                {ag}
              </option>
            ))}
          </select>

          {/* Gender Dropdown */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer sm:w-auto w-full"
          >
            <option value="All">All Genders</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors sm:w-auto w-full"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500">
          Showing {filteredCount} player{filteredCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Mobile: Floating Action Button */}
      {coach && (
        <Link
          to="/manage-players"
          className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-red-700 active:bg-red-800 transition-all flex items-center justify-center no-underline"
          aria-label="Add Player"
        >
          <svg
            className="w-6 h-6"
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
        </Link>
      )}
    </div>
  );
};

export default PlayersFilters;
