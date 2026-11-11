import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AuditTable from "../components/audit/AuditTable";
import AuditFilters from "../components/audit/AuditFilters";
import AuditStatsCards, {
  ActivityChart,
  TopActors,
} from "../components/audit/AuditStatsCards";
import AuditLogsSkeleton from "../components/skeletons/AuditLogsSkeleton";
import ReportGenerator from "../components/audit/ReportGenerator";

/**
 * AuditLogs Page
 * Super Admin dashboard for viewing and filtering audit logs
 */
const AuditLogs = () => {
  const { coach } = useAuth();

  // Data state
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20,
    total: 0,
    pages: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    severity: "",
    category: "",
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
    actorEmail: "",
  });

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      };

      const queryString = new URLSearchParams(params).toString();
      const data = await apiService.get(
        `${API_ENDPOINTS.AUDIT_LOGS}?${queryString}`,
      );

      setLogs(data.logs || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      }));
    } catch (err) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await apiService.get(API_ENDPOINTS.AUDIT_STATS);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handler functions
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      severity: "",
      category: "",
      action: "",
      entityType: "",
      startDate: "",
      endDate: "",
      actorEmail: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Refresh handler
  const handleRefresh = async () => {
    setError("");
    await Promise.all([fetchLogs(), fetchStats()]);
  };

  const handleExport = async (format) => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      }).toString();

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.AUDIT_EXPORT}?${queryParams}`;
      const token = localStorage.getItem("authToken");

      if (format === "csv") {
        // For CSV, use fetch directly to avoid JSON parsing
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Export failed: ${response.status}`,
          );
        }

        const csvText = await response.text();
        const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `audit-logs-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const data = await apiService.get(
          `${API_ENDPOINTS.AUDIT_EXPORT}?${queryParams}`,
        );
        // Download as JSON
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = data.filename || `audit-logs-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      setError(err.message || "Failed to export logs");
    }
  };

  // Check authorization
  if (coach?.role !== "SUPER_ADMIN") {
    return (
      <DashboardLayout title="Access Denied">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              Only Super Admins can access the audit logs.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading && !logs.length) {
    return (
      <DashboardLayout title="Audit Logs">
        <AuditLogsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Audit Logs">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">Audit Logs</h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor all system activities and data changes
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 max-md:order-last"
            title="Refresh audit logs"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
            <span className="max-md:hidden">{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
              Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport("json")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <AuditStatsCards stats={stats} loading={statsLoading} />

      {/* Activity Chart and Top Actors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityChart trends={stats?.trends} />
        <TopActors actors={stats?.topActors} />
      </div>

      {/* Filters */}
      {showFilters && (
        <AuditFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      {/* Audit Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <AuditTable logs={logs} loading={loading} />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-3">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs sm:text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Generator - Moved below logs */}
      <ReportGenerator />
    </DashboardLayout>
  );
};

export default AuditLogs;
