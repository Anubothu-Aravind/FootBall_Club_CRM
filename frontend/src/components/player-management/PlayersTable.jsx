/**
 * Players table/list component - shows desktop table and mobile cards with pagination
 */
const PlayersTable = ({
  players,
  filteredPlayers,
  normalizeAgeGroup,
  onEdit,
  onDelete,
  isSuperAdmin,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  onPageChange = () => {},
}) => {
  if (filteredPlayers.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">No players found</p>
        <p className="text-sm mt-1">
          {players.length > 0
            ? "Try adjusting your filters."
            : 'Click "Add Player" to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Responsive Table - No Horizontal Scroll */}
      <div className="w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:text-[11px] md:px-5 md:py-3.5">Name</th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:hidden md:px-5 md:py-3.5">
                Jersey
              </th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:text-[11px] md:px-5 md:py-3.5">
                Age Group
              </th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:hidden md:px-5 md:py-3.5">
                Gender
              </th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:hidden md:px-5 md:py-3.5">Age</th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:hidden md:px-5 md:py-3.5">City</th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:text-[11px] text-right md:px-5 md:py-3.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((p) => (
              <tr
                key={p.id || p._id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
              >
                <td className="px-3 py-3 font-medium text-gray-900 max-md:text-[11px] md:px-5 md:py-4">
                  <div className="flex flex-col">
                    <span>
                      {[p.first_name, p.middle_name, p.last_name]
                        .filter(Boolean)
                        .join(" ") || `Player ${p.jersey_no || p.id || 'Unknown'}`}
                    </span>
                    <span className="md:hidden text-[10px] text-gray-500 font-normal">
                      #{p.jersey_no} · {p.gender}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-600 max-md:hidden md:px-5 md:py-4">#{p.jersey_no}</td>
                <td className="px-3 py-3 max-md:text-[10px] md:px-5 md:py-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full max-md:text-[10px] md:px-2.5 md:py-1">
                    {normalizeAgeGroup(p.age_group)}
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-600 max-md:hidden md:px-5 md:py-4">{p.gender}</td>
                <td className="px-3 py-3 text-gray-600 max-md:hidden md:px-5 md:py-4">{p.age}</td>
                <td className="px-3 py-3 text-gray-500 max-md:hidden md:px-5 md:py-4">{p.city || "-"}</td>
                <td className="px-3 py-3 md:px-5 md:py-4">
                  <div className="flex items-center gap-1 justify-end md:gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent md:p-2"
                    >
                      <svg
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => onDelete(p)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent md:p-2"
                      >
                        <svg
                          className="w-3.5 h-3.5 md:w-4 md:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">{(currentPage - 1) * 10 + 1}</span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * 10, totalResults)}
            </span>{" "}
            of <span className="font-semibold">{totalResults}</span> players
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer"
            >
              Previous
            </button>
            <div className="flex gap-1 items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors cursor-pointer border-none ${
                      page === currentPage
                        ? "bg-red-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersTable;
