import { Link } from "react-router-dom";

/**
 * AdminManagementHeader Component
 * Header with back link, title, and create new admin button
 */
const AdminManagementHeader = ({ adminCount, onCreateClick }) => {
  return (
    <div className="mb-6">
      <Link
        to="/coach-portal"
        className="text-sm text-gray-500 hover:text-red-600 no-underline flex items-center gap-1 mb-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Coach Portal
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">
            Admin Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {adminCount} admin{adminCount !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 py-2.5 px-5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Admin
        </button>
      </div>
    </div>
  );
};

export default AdminManagementHeader;
