import { useState, useEffect } from "react";

/**
 * Bottom sheet filter modal for Training Management
 * Progressive disclosure pattern with chip-based filter selection
 */
const FilterModal = ({ 
  isOpen, 
  onClose, 
  filterStatus,
  filterGroup,
  filterType,
  setFilterStatus,
  setFilterGroup,
  setFilterType,
  statuses,
  ageGroups,
  types
}) => {
  const [localStatus, setLocalStatus] = useState(filterStatus);
  const [localGroup, setLocalGroup] = useState(filterGroup);
  const [localType, setLocalType] = useState(filterType);

  useEffect(() => {
    if (isOpen) {
      setLocalStatus(filterStatus);
      setLocalGroup(filterGroup);
      setLocalType(filterType);
    }
  }, [isOpen, filterStatus, filterGroup, filterType]);

  const handleApply = () => {
    setFilterStatus(localStatus);
    setFilterGroup(localGroup);
    setFilterType(localType);
    onClose();
  };

  const handleClear = () => {
    setLocalStatus("");
    setLocalGroup("");
    setLocalType("");
    setFilterStatus("");
    setFilterGroup("");
    setFilterType("");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Bottom Sheet */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl animate-slideUp">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filter Training Sessions</h2>
          <p className="text-sm text-gray-500 mt-1">Select filters to refine your results</p>
        </div>

        {/* Filter Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* Status Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setLocalStatus(localStatus === status ? "" : status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer ${
                    localStatus === status
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Age Group</label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setLocalGroup(localGroup === group ? "" : group)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer ${
                    localGroup === group
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setLocalType(localType === type ? "" : type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer ${
                    localType === type
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors border-none cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors border-none cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
