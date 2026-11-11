import { useState } from "react";

/**
 * FilterModal Component - Progressive Disclosure Pattern
 * Bottom sheet style modal for filters
 */
const FilterModal = ({ 
  isOpen, 
  onClose, 
  filterStatus, 
  setFilterStatus, 
  filterGroup, 
  setFilterGroup,
  statuses,
  ageGroups,
  hasActiveFilters,
  clearFilters
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    clearFilters();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed inset-x-0 bottom-0 z-[101] animate-slideUp">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filter Tournaments</h3>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("")}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    filterStatus === ""
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      filterStatus === status
                        ? status === "Upcoming"
                          ? "bg-blue-500 text-white shadow-sm"
                          : status === "Ongoing"
                          ? "bg-green-500 text-white shadow-sm"
                          : "bg-gray-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Age Group</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterGroup("")}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    filterGroup === ""
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Ages
                </button>
                {ageGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setFilterGroup(group)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      filterGroup === group
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="flex-1 py-3.5 px-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
