/**
 * Filter controls for Player Management
 */
const PlayerFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterGroup, 
  setFilterGroup, 
  filterGender, 
  setFilterGender,
  ageGroups 
}) => {
  const hasActiveFilters = searchTerm || filterGroup || filterGender;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterGroup("");
    setFilterGender("");
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search by name…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-56 max-sm:w-full"
      />
      <select 
        value={filterGroup} 
        onChange={(e) => setFilterGroup(e.target.value)} 
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">All Age Groups</option>
        {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
      <select 
        value={filterGender} 
        onChange={(e) => setFilterGender(e.target.value)} 
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">All Genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      {hasActiveFilters && (
        <button 
          onClick={clearFilters} 
          className="text-sm text-red-600 hover:text-red-700 font-medium bg-transparent border-none cursor-pointer"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default PlayerFilters;
