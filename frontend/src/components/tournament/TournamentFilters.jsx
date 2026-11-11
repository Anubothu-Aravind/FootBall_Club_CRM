import { useState } from "react";
import FilterModal from "./FilterModal";

/**
 * Search and Filter controls with Progressive Disclosure
 * Modern Jakob's Law design - clean search and filter layout
 */
const TournamentFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterGroup,
  setFilterGroup,
  statuses,
  ageGroups,
  onAddTournament,
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const hasActiveFilters = filterStatus || filterGroup;

  const clearFilters = () => {
    setFilterStatus("");
    setFilterGroup("");
  };

  return (
    <>
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 py-4 -mx-6 px-6 max-md:-mx-5 max-md:px-5">
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
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterModal(true)}
          className="relative inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors sm:w-auto w-full"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {(filterStatus ? 1 : 0) + (filterGroup ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: Floating Action Button */}
      <button
        onClick={onAddTournament}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-red-700 active:bg-red-800 transition-all flex items-center justify-center"
        aria-label="Add Tournament"
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
      </button>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        statuses={statuses}
        ageGroups={ageGroups}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />
    </>
  );
};

export default TournamentFilters;
