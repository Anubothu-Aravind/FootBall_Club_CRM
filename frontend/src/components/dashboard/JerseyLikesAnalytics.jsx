import { useState, useEffect, useRef } from "react";
import { apiService, API_ENDPOINTS } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/**
 * JerseyLikesAnalytics Component - Redesigned
 * Modern SaaS-style dashboard following UX principles:
 * - Hick's Law: Reduced action choices with primary/secondary hierarchy
 * - Fitts's Law: Larger tap targets, easier to click
 * - Law of Proximity: Grouped related actions
 * - Cognitive Load Reduction: Merged columns, cleaner layout
 * - Mobile-first: Card-based responsive design
 */
const JerseyLikesAnalytics = () => {
  const { coach } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [selectedJersey, setSelectedJersey] = useState(null);
  const [likeDetails, setLikeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(
        API_ENDPOINTS.JERSEY_LIKE_ANALYTICS,
      );
      if (response.success) {
        setAnalytics(response);
      } else {
        setAnalytics({
          success: true,
          summary: {
            totalLikes: 0,
            totalAuthenticatedLikes: 0,
            totalAnonymousLikes: 0,
            totalJerseys: 0,
          },
          jerseys: [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics({
        success: true,
        summary: {
          totalLikes: 0,
          totalAuthenticatedLikes: 0,
          totalAnonymousLikes: 0,
          totalJerseys: 0,
        },
        jerseys: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJerseyDetails = async (jerseyId) => {
    setDetailsLoading(true);
    try {
      const response = await apiService.get(
        API_ENDPOINTS.JERSEY_LIKE_DETAILS(jerseyId),
      );
      if (response.success) {
        setLikeDetails(response);
        setSelectedJersey(jerseyId);
      }
    } catch (error) {
      console.error("Failed to fetch jersey details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReset = async (jerseyId) => {
    setConfirmModal({
      type: "reset",
      jerseyId,
      title: "Reset Jersey Likes",
      message:
        "Are you sure you want to reset all likes for this jersey? This will mark them as inactive but can be restored later.",
      confirmText: "Reset",
      confirmClass: "bg-yellow-600 hover:bg-yellow-700",
    });
  };

  const handleRestore = async (jerseyId) => {
    setConfirmModal({
      type: "restore",
      jerseyId,
      title: "Restore Jersey Likes",
      message:
        "Are you sure you want to restore all previously reset likes for this jersey?",
      confirmText: "Restore",
      confirmClass: "bg-green-600 hover:bg-green-700",
    });
  };

  const handleDelete = async (jerseyId) => {
    if (coach?.role !== "SUPER_ADMIN") {
      alert("Only Super Admins can permanently delete likes.");
      return;
    }

    setConfirmModal({
      type: "delete",
      jerseyId,
      title: "Permanently Delete Likes",
      message:
        "⚠️ WARNING: This will PERMANENTLY delete all likes for this jersey. This action cannot be undone and data cannot be recovered.",
      confirmText: "Delete Forever",
      confirmClass: "bg-red-600 hover:bg-red-700",
    });
  };

  const executeAction = async () => {
    if (!confirmModal) return;

    const { type, jerseyId } = confirmModal;
    setOpenDropdown(null);
    setConfirmModal(null);

    setActionLoading((prev) => ({ ...prev, [`${type}-${jerseyId}`]: true }));
    try {
      let response;
      if (type === "reset") {
        response = await apiService.post(
          API_ENDPOINTS.JERSEY_LIKE_RESET(jerseyId),
        );
      } else if (type === "restore") {
        response = await apiService.post(
          API_ENDPOINTS.JERSEY_LIKE_RESTORE(jerseyId),
        );
      } else if (type === "delete") {
        response = await apiService.delete(
          API_ENDPOINTS.JERSEY_LIKE_DELETE(jerseyId),
        );
      }

      if (response?.success) {
        alert(response.message);
        await fetchAnalytics();
        if (selectedJersey === jerseyId) {
          if (type === "delete") {
            setSelectedJersey(null);
            setLikeDetails(null);
          } else {
            await fetchJerseyDetails(jerseyId);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to ${type} likes:`, error);
      alert(`Failed to ${type} likes. Please try again.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`${type}-${jerseyId}`]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Failed to load analytics. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide">
              Total Likes
            </h3>
            <svg
              className="w-7 h-7 opacity-75"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-3xl md:text-4xl font-bold">
            {analytics?.summary?.totalLikes?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Authenticated
            </h3>
            <svg
              className="w-7 h-7 text-blue-500"
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
          </div>
          <p className="text-3xl md:text-4xl font-bold text-gray-900">
            {analytics?.summary?.totalAuthenticatedLikes?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Anonymous
            </h3>
            <svg
              className="w-7 h-7 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-gray-900">
            {analytics?.summary?.totalAnonymousLikes?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total Jerseys
            </h3>
            <svg
              className="w-7 h-7 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-gray-900">
            {analytics?.summary?.totalJerseys || 0}
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Jersey Like Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor jersey engagement
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jersey
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {analytics?.jerseys?.map((jersey, index) => (
                <tr
                  key={jersey._id}
                  className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-orange-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {jersey.jerseyDetails?.season || jersey._id}
                        </div>
                        <div
                          className="text-xs text-gray-400 font-mono truncate max-w-[140px]"
                          title={jersey._id}
                        >
                          {jersey._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {jersey.jerseyDetails?.season || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {jersey.jerseyDetails?.colorway || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-orange-50 text-orange-700 w-fit">
                        {jersey.totalLikes.toLocaleString()} Total
                      </span>
                      <span className="text-xs text-gray-500">
                        {jersey.authenticatedLikes} Auth ·{" "}
                        {jersey.anonymousLikes} Anon
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(jersey.lastLikeAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Primary Action: View Details */}
                      <button
                        onClick={() => fetchJerseyDetails(jersey._id)}
                        disabled={
                          detailsLoading && selectedJersey === jersey._id
                        }
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        {detailsLoading && selectedJersey === jersey._id ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Secondary Actions: Dropdown Menu */}
                      <div
                        className="relative"
                        ref={openDropdown === jersey._id ? dropdownRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === jersey._id ? null : jersey._id,
                            )
                          }
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                          title="More Actions"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {openDropdown === jersey._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => handleReset(jersey._id)}
                              disabled={actionLoading[`reset-${jersey._id}`]}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              {actionLoading[`reset-${jersey._id}`]
                                ? "Resetting..."
                                : "Reset Likes"}
                            </button>
                            <button
                              onClick={() => handleRestore(jersey._id)}
                              disabled={actionLoading[`restore-${jersey._id}`]}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                              {actionLoading[`restore-${jersey._id}`]
                                ? "Restoring..."
                                : "Restore Likes"}
                            </button>
                            {coach?.role === "SUPER_ADMIN" && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => handleDelete(jersey._id)}
                                  disabled={
                                    actionLoading[`delete-${jersey._id}`]
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                  {actionLoading[`delete-${jersey._id}`]
                                    ? "Deleting..."
                                    : "Delete Forever"}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!analytics?.jerseys?.length && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No jersey likes found.</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {analytics?.jerseys?.map((jersey) => (
          <div
            key={jersey._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {jersey.jerseyDetails?.season || jersey._id}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {jersey.jerseyDetails?.colorway || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedCards((prev) => ({
                      ...prev,
                      [jersey._id]: !prev[jersey._id],
                    }))
                  }
                  className="flex-shrink-0 ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedCards[jersey._id] ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Likes</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700">
                  {jersey.totalLikes.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Activity</span>
                <span className="text-sm text-gray-900">
                  {formatDate(jersey.lastLikeAt)}
                </span>
              </div>

              {/* Expanded Details */}
              {expandedCards[jersey._id] && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Authenticated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {jersey.authenticatedLikes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Anonymous</span>
                    <span className="text-sm font-medium text-gray-900">
                      {jersey.anonymousLikes}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer - Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => fetchJerseyDetails(jersey._id)}
                disabled={detailsLoading && selectedJersey === jersey._id}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View
              </button>

              <div
                className="relative"
                ref={openDropdown === jersey._id ? dropdownRef : null}
              >
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === jersey._id ? null : jersey._id,
                    )
                  }
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {openDropdown === jersey._id && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => handleReset(jersey._id)}
                      disabled={actionLoading[`reset-${jersey._id}`]}
                      className="w-full min-h-[44px] px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span className="font-medium">
                        {actionLoading[`reset-${jersey._id}`]
                          ? "Resetting..."
                          : "Reset Likes"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleRestore(jersey._id)}
                      disabled={actionLoading[`restore-${jersey._id}`]}
                      className="w-full min-h-[44px] px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span className="font-medium">
                        {actionLoading[`restore-${jersey._id}`]
                          ? "Restoring..."
                          : "Restore Likes"}
                      </span>
                    </button>
                    {coach?.role === "SUPER_ADMIN" && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => handleDelete(jersey._id)}
                          disabled={actionLoading[`delete-${jersey._id}`]}
                          className="w-full min-h-[44px] px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-medium"
                        >
                          <svg
                            className="w-5 h-5"
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
                          <span>
                            {actionLoading[`delete-${jersey._id}`]
                              ? "Deleting..."
                              : "Delete Forever"}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {!analytics?.jerseys?.length && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No jersey likes found.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setConfirmModal(null)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div
                  className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    confirmModal.type === "delete"
                      ? "bg-red-100"
                      : confirmModal.type === "reset"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                  }`}
                >
                  {confirmModal.type === "delete" ? (
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  ) : confirmModal.type === "reset" ? (
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {confirmModal.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {confirmModal.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={executeAction}
                  className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors ${confirmModal.confirmClass}`}
                >
                  {confirmModal.confirmText}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Like Details Modal */}
      {selectedJersey && likeDetails && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mt-8">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Like Details: {selectedJersey}
            </h3>
            <button
              onClick={() => {
                setSelectedJersey(null);
                setLikeDetails(null);
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4 flex gap-4">
              <p className="text-sm text-gray-600">
                Total Likes:{" "}
                <span className="font-bold text-gray-900">
                  {likeDetails.totalLikes}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Showing:{" "}
                <span className="font-bold text-gray-900">
                  {likeDetails.count}
                </span>{" "}
                records
              </p>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Liked At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      IP Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Device
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {likeDetails.likes.map((like) => (
                    <tr key={like.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {like.userName || "Anonymous"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {like.userEmail || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${like.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {like.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(like.likedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {like.ipAddress || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {like.metadata?.deviceType || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JerseyLikesAnalytics;
