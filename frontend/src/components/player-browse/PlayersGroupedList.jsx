/**
 * Unified player table with mobile-optimized responsive layout
 * Matches Player Management UI design
 */
const PlayersGroupedList = ({
  players,
  genderLabel,
  positionColor,
  genderColor,
}) => {
  if (players.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-lg font-medium">No players found</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  const getPlayerName = (player) => {
    return (
      [player.first_name, player.middle_name, player.last_name]
        .filter(Boolean)
        .join(" ") || `Player ${player.jersey_no || player.id || "Unknown"}`
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Responsive Table - Unified for Desktop & Mobile */}
      <div className="w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:text-[11px] md:px-5 md:py-3.5">
                Player Name
              </th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:text-[11px] md:px-5 md:py-3.5">
                Age Group
              </th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:hidden md:px-5 md:py-3.5">
                Gender
              </th>
              <th className="px-3 py-3 font-semibold text-gray-600 max-md:hidden md:px-5 md:py-3.5">
                Size
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                key={player.id || player._id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
              >
                <td className="px-3 py-3 font-medium text-gray-900 max-md:text-[11px] md:px-5 md:py-4">
                  <div className="flex flex-col">
                    <span>{getPlayerName(player)}</span>
                    <span className="md:hidden text-[10px] text-gray-500 font-normal">
                      {genderLabel(player.gender)} · {player.size || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 max-md:text-[10px] md:px-5 md:py-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full max-md:text-[10px] md:px-2.5 md:py-1">
                    {player.age_group}
                  </span>
                </td>
                <td
                  className={`px-3 py-3 text-gray-600 max-md:hidden md:px-5 md:py-4 ${genderColor(player.gender)}`}
                >
                  {genderLabel(player.gender)}
                </td>
                <td
                  className={`px-3 py-3 max-md:hidden md:px-5 md:py-4 ${positionColor(player.size)}`}
                >
                  {player.size || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersGroupedList;
