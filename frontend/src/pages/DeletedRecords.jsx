import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { EntityTypeBadge, TimeBadge } from "../components/audit/AuditBadges";

/**
 * DeletedRecords Page
 * Super Admin page for viewing and restoring deleted records
 */
const DeletedRecords = () => {
  const { coach } = useAuth();

  // Data state
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [previewModal, setPreviewModal] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Fetch deleted records
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint =
        activeTab === "ALL"
          ? API_ENDPOINTS.DELETED_RECORDS
          : API_ENDPOINTS.DELETED_BY_TYPE(activeTab);

      const queryString = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      }).toString();

      const data = await apiService.get(`${endpoint}?${queryString}`);
      setRecords(data.records || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      }));
    } catch (err) {
      setError(err.message || "Failed to load deleted records");
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.RESTORE_STATS);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Flash messages
  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const flashError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  // Preview a deleted record
  const handlePreview = async (record) => {
    try {
      const data = await apiService.get(
        API_ENDPOINTS.RESTORE_PREVIEW(record.entityType, record.id),
      );
      setPreviewModal(data);
    } catch (err) {
      flashError(err.message || "Failed to load preview");
    }
  };

  // Restore a deleted record
  const handleRestore = async (record) => {
    try {
      setRestoreLoading(true);
      await apiService.post(
        API_ENDPOINTS.RESTORE_RECORD(record.entityType, record.id),
      );
      flash(`Successfully restored ${record.entityName}`);
      setPreviewModal(null);
      fetchRecords();
      fetchStats();
    } catch (err) {
      flashError(err.message || "Failed to restore record");
    } finally {
      setRestoreLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Check authorization
  if (coach?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">Access Denied</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Only Super Admins can access deleted records.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "ALL", label: "All", count: stats?.pending?.total || 0 },
    { key: "PLAYER", label: "Players", count: stats?.pending?.PLAYER || 0 },
    {
      key: "TOURNAMENT",
      label: "Tournaments",
      count: stats?.pending?.TOURNAMENT || 0,
    },
    { key: "ADMIN", label: "Admins", count: stats?.pending?.ADMIN || 0 },
  ];

  return (
    <DashboardLayout title="Deleted Records">
      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-red-500"
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
            <span className="text-xl sm:text-2xl font-bold text-red-600">
              {stats?.pending?.total || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
            Pending
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xl sm:text-2xl font-bold text-green-600">
              {stats?.restored?.total || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
            Restored
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xl sm:text-2xl font-bold text-blue-600">
              {stats?.pending?.PLAYER || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
            Players
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <span className="text-xl sm:text-2xl font-bold text-amber-600">
              {stats?.pending?.TOURNAMENT || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
            Tournaments
          </p>
        </div>
      </div>

      {/* Tabs - Fitts's Law: Enhanced touch targets */}
      <div className="flex gap-2 mb-5 overflow-x-auto max-md:gap-1.5 max-md:mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] shadow-sm max-md:px-3.5 max-md:py-2 max-md:text-xs max-md:min-h-[40px] ${
              activeTab === tab.key
                ? "bg-red-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold max-md:ml-1.5 max-md:px-1.5 ${
                  activeTab === tab.key
                    ? "bg-white/25 text-white"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">--</div>
            <p>No deleted records found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="min-w-full divide-y divide-gray-200 max-md:hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deleted By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deleted At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Days Until Purge
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <EntityTypeBadge entityType={record.entityType} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.entityName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {record.deletedByEmail}
                    </td>
                    <td className="px-4 py-3">
                      <TimeBadge timestamp={record.deletedAt} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          record.daysUntilPurge <= 3
                            ? "bg-red-100 text-red-800"
                            : record.daysUntilPurge <= 7
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {record.daysUntilPurge} days
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(record)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleRestore(record)}
                          disabled={!record.canRestore?.canRestore}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View - Visual Hierarchy & Law of Proximity */}
            <div className="md:hidden space-y-3 p-3 max-[480px]:space-y-2.5 max-[480px]:p-2.5">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow max-[480px]:p-3.5"
                >
                  {/* Header Row - Entity Badge & Days Badge */}
                  <div className="flex items-center justify-between mb-3 max-[480px]:mb-2.5">
                    <EntityTypeBadge entityType={record.entityType} />
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold max-[480px]:px-2.5 max-[480px]:py-1 max-[480px]:text-[11px] ${
                        record.daysUntilPurge <= 3
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : record.daysUntilPurge <= 7
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-green-100 text-green-800 border border-green-200"
                      }`}
                    >
                      {record.daysUntilPurge} days
                    </span>
                  </div>

                  {/* Entity Name — Visual Hierarchy */}
                  <h3 className="font-bold text-gray-900 mb-3 text-base leading-tight max-[480px]:text-[15px] max-[480px]:mb-2.5">
                    {record.entityName}
                  </h3>

                  {/* Info Group — Law of Proximity */}
                  <div className="space-y-2 mb-4 max-[480px]:space-y-1.5 max-[480px]:mb-3">
                    {/* Deleted By */}
                    <div className="flex items-center text-sm text-gray-600 max-[480px]:text-xs">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400 shrink-0 max-[480px]:w-3.5 max-[480px]:h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate font-medium">
                        {record.deletedByEmail}
                      </span>
                    </div>
                    {/* Deleted At */}
                    <div className="flex items-center">
                      <TimeBadge timestamp={record.deletedAt} />
                    </div>
                  </div>

                  {/* Action Buttons - Fitts's Law: Large touch targets */}
                  <div className="flex gap-2.5 max-[480px]:gap-2">
                    <button
                      onClick={() => handlePreview(record)}
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors min-h-[44px] max-[480px]:text-xs max-[480px]:py-2 max-[480px]:min-h-[40px]"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleRestore(record)}
                      disabled={!record.canRestore?.canRestore}
                      className="flex-1 px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors min-h-[44px] shadow-sm hover:shadow max-[480px]:text-xs max-[480px]:py-2 max-[480px]:min-h-[40px]"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Fitts's Law */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-gray-200 max-md:px-3 max-md:py-3">
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2.5 max-md:gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[44px] max-md:min-h-[40px] max-md:text-xs max-md:px-4"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[44px] max-md:min-h-[40px] max-md:text-xs max-md:px-4"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold truncate pr-4">
                {previewModal.entityName}
              </h3>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <EntityTypeBadge entityType={previewModal.entityType} />
                  <TimeBadge timestamp={previewModal.deletedAt} />
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                    Deleted By
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700 break-words">
                    {previewModal.deletedBy}
                  </p>
                </div>

                {previewModal.deletionReason && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                      Reason
                    </h4>
                    <p className="text-sm sm:text-base text-gray-700">
                      {previewModal.deletionReason}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                    Original Data
                  </h4>
                  <pre className="text-xs bg-gray-50 p-3 sm:p-4 rounded-lg overflow-auto max-h-64 border border-gray-200">
                    {JSON.stringify(previewModal.originalData, null, 2)}
                  </pre>
                </div>

                {!previewModal.canRestore?.canRestore && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
                    Cannot restore: {previewModal.canRestore?.reason}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 p-4 sm:p-5 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setPreviewModal(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                Close
              </button>
              <button
                onClick={() => handleRestore(previewModal)}
                disabled={
                  !previewModal.canRestore?.canRestore || restoreLoading
                }
                className="px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {restoreLoading ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DeletedRecords;
