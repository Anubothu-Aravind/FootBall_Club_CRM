import React, { useState } from "react";
import {
  SeverityBadge,
  ActionBadge,
  EntityTypeBadge,
  ActorBadge,
  TimeBadge,
} from "./AuditBadges";

/**
 * AuditTable Component
 * Displays paginated audit logs in a table format (desktop) and cards (mobile)
 */
const AuditTable = ({ logs, loading, onRowClick }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No audit logs found</p>
        <p className="text-sm mt-1">Adjust your filters to see more results</p>
      </div>
    );
  }

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="overflow-x-auto max-md:hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(log.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TimeBadge timestamp={log.createdAt} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SeverityBadge severity={log.severity} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <EntityTypeBadge entityType={log.entityType} />
                      <span className="text-xs text-gray-600 truncate max-w-[150px]">
                        {log.entityName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {log.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ActorBadge email={log.actorEmail} role={log.actorRole} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {log.ipAddress || "-"}
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr key={`${log.id}-expanded`}>
                    <td colSpan={7} className="px-4 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Changed Fields */}
                        {log.changedFields && log.changedFields.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                              Changed Fields
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {log.changedFields.map((field) => (
                                <span
                                  key={field}
                                  className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Previous Data */}
                        {log.previousData && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                              Previous Data
                            </h4>
                            <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(log.previousData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* New Data */}
                        {log.newData && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                              New Data
                            </h4>
                            <pre className="text-xs bg-green-50 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(log.newData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Metadata */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                            Details
                          </h4>
                          <div className="text-xs space-y-1">
                            <p>
                              <strong>Log ID:</strong> {log.id}
                            </p>
                            <p>
                              <strong>Entity ID:</strong> {log.entityId || "-"}
                            </p>
                            <p>
                              <strong>Session:</strong> {log.sessionId || "-"}
                            </p>
                            <p>
                              <strong>User Agent:</strong>{" "}
                              <span className="text-gray-500 truncate">
                                {log.userAgent || "-"}
                              </span>
                            </p>
                            <p>
                              <strong>Full Timestamp:</strong>{" "}
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {onRowClick && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(log);
                          }}
                          className="mt-3 text-sm text-red-600 hover:text-red-800 border-none bg-transparent cursor-pointer"
                        >
                          View Full Details →
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            {/* Header: Severity & Time */}
            <div className="flex items-start justify-between mb-3">
              <SeverityBadge severity={log.severity} />
              <TimeBadge timestamp={log.createdAt} />
            </div>

            {/* Action & Entity */}
            <div className="flex flex-wrap gap-2 mb-3">
              <ActionBadge action={log.action} />
              <EntityTypeBadge entityType={log.entityType} />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {log.description}
            </p>

            {/* Entity Name */}
            {log.entityName && (
              <div className="text-xs text-gray-500 mb-2">
                <strong>Entity:</strong> {log.entityName}
              </div>
            )}

            {/* Actor */}
            <div className="mb-3">
              <ActorBadge email={log.actorEmail} role={log.actorRole} />
            </div>

            {/* IP Address */}
            {log.ipAddress && (
              <div className="text-xs text-gray-500 mb-3">
                <strong>IP:</strong> {log.ipAddress}
              </div>
            )}

            {/* Expand Button */}
            <button
              onClick={() => toggleRow(log.id)}
              className="w-full py-2 px-4 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border-none cursor-pointer flex items-center justify-center gap-2"
            >
              {expandedRow === log.id ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Hide Details
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View Details
                </>
              )}
            </button>

            {/* Expanded Details */}
            {expandedRow === log.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                {/* Changed Fields */}
                {log.changedFields && log.changedFields.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Changed Fields
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {log.changedFields.map((field) => (
                        <span
                          key={field}
                          className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Data */}
                {log.previousData && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Previous Data
                    </h4>
                    <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.previousData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* New Data */}
                {log.newData && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      New Data
                    </h4>
                    <pre className="text-xs bg-green-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.newData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Details
                  </h4>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Log ID:</strong> {log.id}
                    </p>
                    <p>
                      <strong>Entity ID:</strong> {log.entityId || "-"}
                    </p>
                    <p>
                      <strong>Session:</strong> {log.sessionId || "-"}
                    </p>
                    <p>
                      <strong>User Agent:</strong>{" "}
                      <span className="text-gray-500 break-all">
                        {log.userAgent || "-"}
                      </span>
                    </p>
                    <p>
                      <strong>Full Timestamp:</strong>{" "}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {onRowClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(log);
                    }}
                    className="w-full text-sm text-red-600 hover:text-red-800 border-none bg-transparent cursor-pointer"
                  >
                    View Full Details →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AuditTable;
