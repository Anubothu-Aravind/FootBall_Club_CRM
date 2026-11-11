import { useState } from "react";

/**
 * Trainings table/list component - shows desktop table and mobile cards
 */
const TrainingsTable = ({ 
  trainings, 
  filteredTrainings, 
  statusColor, 
  typeColor,
  onEdit, 
  onDelete, 
  isSuperAdmin 
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  if (filteredTrainings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium">No training sessions found</p>
        <p className="text-sm mt-1">
          {trainings.length > 0 ? "Try adjusting your filters." : "Click \"Add Training Session\" to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Desktop */}
      <div className="overflow-x-auto max-md:hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-5 py-3.5 font-semibold text-gray-600">Title</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Type</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Age Group</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Status</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Date</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Duration</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Location</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrainings.map((t) => (
              <tr key={t.id || t._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-4 font-medium text-gray-900">{t.title}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(t.type)}`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {t.age_group}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {formatDate(t.session_date)}
                </td>
                <td className="px-5 py-4 text-gray-600 text-xs">
                  {formatDuration(t.duration)}
                </td>
                <td className="px-5 py-4 text-gray-600">{t.location}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button 
                      onClick={() => onEdit(t)} 
                      title="Edit" 
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => onDelete(t)} 
                        title="Delete" 
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 p-4">
        {filteredTrainings.map((t) => (
          <div key={t.id || t._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            {/* Top Row: Title and Status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">{t.title}</h3>
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(t.status)}`}>
                  {t.status}
                </span>
              </div>
              <div className="relative ml-3">
                <button
                  onClick={() => toggleMenu(t.id || t._id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                {openMenuId === (t.id || t._id) && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => { onEdit(t); setOpenMenuId(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-none bg-transparent cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <button
                      onClick={() => { onEdit(t); setOpenMenuId(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-none bg-transparent cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => { onDelete(t); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-none bg-transparent cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Type & Age Group Pills */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(t.type)}`}>
                {t.type}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                {t.age_group}
              </span>
            </div>

            {/* Details with Icons */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{t.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(t.session_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(t.duration)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingsTable;
