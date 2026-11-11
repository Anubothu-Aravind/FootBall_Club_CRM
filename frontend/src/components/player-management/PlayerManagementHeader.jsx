import { Link } from "react-router-dom";

/**
 * Header section for Player Management
 */
const PlayerManagementHeader = ({ playersCount, onAddPlayer }) => {
  return (
    <>
      <Link to="/coach-portal" className="text-sm text-gray-500 hover:text-red-600 no-underline flex items-center gap-1 mb-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Coach Portal
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">Player Management</h1>
          <p className="text-gray-500 text-sm mt-1">{playersCount} player{playersCount !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={onAddPlayer} className="flex items-center gap-2 py-2.5 px-5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Player
        </button>
      </div>
    </>
  );
};

export default PlayerManagementHeader;
