import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * ExportCenter Page
 * Unified export dashboard with all data sections, format options,
 * and visible/hidden field controls.
 */
const ExportCenter = () => {
  const { coach } = useAuth();
  const [exportInfo, setExportInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [includeHidden, setIncludeHidden] = useState({});
  const [filters, setFilters] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [pendingExport, setPendingExport] = useState(null);

  // Available columns for player export
  const PLAYER_COLUMNS = [
    { field: "full_name", label: "Full Name" },
    { field: "age", label: "Age" },
    { field: "age_group", label: "Age Group" },
    { field: "gender", label: "Gender" },
    { field: "size", label: "Size" },
    { field: "height", label: "Height" },
    { field: "weight", label: "Weight" },
    { field: "jersey_no", label: "Jersey No" },
    { field: "city", label: "City" },
    { field: "createdAt", label: "Created At" },
  ];

  useEffect(() => {
    fetchExportInfo();
  }, []);

  const fetchExportInfo = async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.EXPORT_INFO);
      setExportInfo(data);
    } catch (err) {
      setError(err.message || "Failed to load export info");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (sectionId, format, customColumns = null) => {
    const key = `${sectionId}-${format}`;
    setExporting((prev) => ({ ...prev, [key]: true }));
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({
        format,
        includeHidden: includeHidden[sectionId] ? "true" : "false",
      });

      // Add selected columns for Excel export
      if (customColumns && customColumns.length > 0) {
        params.append("selectedColumns", customColumns.join(","));
      }

      // Add filters if they exist for this section
      if (filters[sectionId]) {
        Object.entries(filters[sectionId]).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const url = `${API_BASE_URL}${API_ENDPOINTS.EXPORT_SECTION(sectionId)}?${params}`;

      if (format === "csv" || format === "xlsx") {
        // For file downloads, use fetch directly
        const response = await fetch(url, {
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

        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `${sectionId}-export.${format}`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) filename = match[1];
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        // JSON format
        const data = await apiService.get(
          `${API_ENDPOINTS.EXPORT_SECTION(sectionId)}?${params}`,
        );
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = data.filename || `${sectionId}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }

      setSuccess(
        `${sectionId} exported as ${format.toUpperCase()} successfully!`,
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Export failed");
    } finally {
      setExporting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleHidden = (sectionId) => {
    setIncludeHidden((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const updateFilter = (sectionId, filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [filterKey]: value,
      },
    }));
  };

  const clearFilters = (sectionId) => {
    setFilters((prev) => ({
      ...prev,
      [sectionId]: {},
    }));
  };

  // Column selection handlers
  const openColumnSelector = (sectionId, format) => {
    setPendingExport({ sectionId, format });
    setSelectedColumns(PLAYER_COLUMNS.map((col) => col.field));
    setShowColumnSelector(true);
  };

  const toggleColumn = (field) => {
    setSelectedColumns((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(PLAYER_COLUMNS.map((col) => col.field));
  };

  const clearAllColumns = () => {
    setSelectedColumns([]);
  };

  const confirmExport = () => {
    if (pendingExport && selectedColumns.length > 0) {
      setShowColumnSelector(false);
      handleExport(
        pendingExport.sectionId,
        pendingExport.format,
        selectedColumns,
      );
      setPendingExport(null);
    }
  };

  const cancelColumnSelection = () => {
    setShowColumnSelector(false);
    setPendingExport(null);
    setSelectedColumns([]);
  };

  const renderFilters = (sectionId) => {
    const sectionFilters = filters[sectionId] || {};

    if (sectionId === "players") {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Filters</h4>
            {Object.values(sectionFilters).some((v) => v) && (
              <button
                onClick={() => clearFilters(sectionId)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {/* Row 1: Name & Age Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={sectionFilters.name || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "name", e.target.value)
                }
                placeholder="Player Name"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                value={sectionFilters.age_group || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "age_group", e.target.value)
                }
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Age Groups</option>
                <option value="Under 8">Under 8</option>
                <option value="Under 10">Under 10</option>
                <option value="Under 13">Under 13</option>
                <option value="Under 16">Under 16</option>
                <option value="Under 19">Under 19</option>
              </select>
              <select
                value={sectionFilters.gender || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "gender", e.target.value)
                }
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            {/* Row 2: Age Range & City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="number"
                value={sectionFilters.age_min || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "age_min", e.target.value)
                }
                placeholder="Min Age"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                min="5"
                max="25"
              />
              <input
                type="number"
                value={sectionFilters.age_max || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "age_max", e.target.value)
                }
                placeholder="Max Age"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                min="5"
                max="25"
              />
              <input
                type="text"
                value={sectionFilters.city || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "city", e.target.value)
                }
                placeholder="City/Location"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            {/* Row 3: Size, Height, Weight, Jersey No */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={sectionFilters.size || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "size", e.target.value)
                }
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Sizes</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
              <input
                type="number"
                value={sectionFilters.height || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "height", e.target.value)
                }
                placeholder="Height (cm)"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                min="100"
                max="220"
              />
              <input
                type="number"
                value={sectionFilters.weight || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "weight", e.target.value)
                }
                placeholder="Weight (kg)"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                min="20"
                max="120"
              />
              <input
                type="number"
                value={sectionFilters.jersey_no || ""}
                onChange={(e) =>
                  updateFilter(sectionId, "jersey_no", e.target.value)
                }
                placeholder="Jersey #"
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                min="1"
                max="99"
              />
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "tournaments") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Filters</h4>
            {Object.values(sectionFilters).some((v) => v) && (
              <button
                onClick={() => clearFilters(sectionId)}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={sectionFilters.status || ""}
              onChange={(e) =>
                updateFilter(sectionId, "status", e.target.value)
              }
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={sectionFilters.age_group || ""}
              onChange={(e) =>
                updateFilter(sectionId, "age_group", e.target.value)
              }
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Age Groups</option>
              <option value="Under 8">Under 8</option>
              <option value="Under 10">Under 10</option>
              <option value="Under 13">Under 13</option>
              <option value="Under 16">Under 16</option>
              <option value="Under 19">Under 19</option>
            </select>
            <input
              type="text"
              value={sectionFilters.location || ""}
              onChange={(e) =>
                updateFilter(sectionId, "location", e.target.value)
              }
              placeholder="Location"
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const formatIcons = {
    json: (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    csv: (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    xlsx: (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  };

  const formatColors = {
    json: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    csv: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    xlsx: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  };

  const sectionIcons = {
    players: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    tournaments: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    audit: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    deleted: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    ),
  };

  if (loading) {
    return (
      <DashboardLayout title="Export Center">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Export Center">
      {/* Messages - Compact mobile layout */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center text-sm max-md:text-xs max-md:p-2.5">
          <span className="flex-1 pr-2">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none shrink-0"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm max-md:text-xs max-md:p-2.5">
          {success}
        </div>
      )}

      {/* Sections - Optimized for 370px width */}
      <div className="space-y-2 max-md:space-y-2">
        {exportInfo?.sections?.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden max-md:rounded-lg"
          >
            {/* Section Header - Fitts's Law: 56px min touch target */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-14 max-md:min-h-14 max-md:px-3 max-md:py-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 max-md:gap-2.5">
                {/* Icon - Subtle on mobile */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center shrink-0 max-md:w-8 max-md:h-8">
                  {sectionIcons[section.id] || sectionIcons.players}
                </div>
                {/* Text Group - Law of Proximity: Tighter spacing */}
                <div className="text-left min-w-0 flex-1">
                  <h2 className="text-[15px] sm:text-base font-semibold text-gray-900 truncate leading-tight max-md:text-sm">
                    {section.label}
                  </h2>
                  <p className="text-xs text-gray-500 truncate mt-0.5 max-md:text-[11px] max-md:mt-0">
                    {section.description}
                  </p>
                </div>
              </div>
              {/* Right Side - Subtle badge */}
              <div className="flex items-center gap-2 ml-2 shrink-0 max-md:gap-1.5">
                {/* Record Count Badge - Reduced dominance */}
                <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md max-md:text-[11px] max-md:min-w-6 max-md:h-5 max-md:px-1.5">
                  {section.recordCount}
                </span>
                {section.requiresRole && (
                  <span className="hidden sm:inline text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                    {section.requiresRole}
                  </span>
                )}
                {/* Chevron Icon - Larger tap area */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform shrink-0 max-md:w-4 max-md:h-4 ${
                    expandedSections[section.id] ? "rotate-180" : ""
                  }`}
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
              </div>
            </button>

            {/* Expanded Content - Reduced padding for mobile */}
            {expandedSections[section.id] && (
              <div className="border-t border-gray-200 p-4 space-y-4 max-md:px-3 max-md:py-3 max-md:space-y-3">
                {/* Filters */}
                {renderFilters(section.id)}

                {/* Visible Fields - Compact badges */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5 max-md:text-[11px]">
                    <svg
                      className="w-3.5 h-3.5 text-green-600 shrink-0 max-md:w-3 max-md:h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Visible Fields
                  </h3>
                  <div className="flex flex-wrap gap-1.5 max-md:gap-1">
                    {section.visibleFields.map((field) => (
                      <span
                        key={field}
                        className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 max-md:text-[10px] max-md:px-1.5"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hidden Fields Toggle - Compact layout */}
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 max-md:text-[11px]">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400 shrink-0 max-md:w-3 max-md:h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                      Hidden
                    </h3>
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={includeHidden[section.id] || false}
                        onChange={() => toggleHidden(section.id)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 max-md:w-3.5 max-md:h-3.5"
                      />
                      <span className="text-[11px] text-gray-600 max-md:text-[10px]">
                        Include
                      </span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-md:gap-1">
                    {section.hiddenFields.map((field) => (
                      <span
                        key={field}
                        className={`text-[11px] px-2 py-0.5 rounded border max-md:text-[10px] max-md:px-1.5 ${
                          includeHidden[section.id]
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-400 border-gray-200 line-through"
                        }`}
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Export Buttons - Stacked on mobile, reduced visual weight */}
                <div className="pt-3 border-t border-gray-200 max-md:pt-2.5">
                  <p className="text-xs text-gray-600 mb-2 font-medium max-md:text-[11px] max-md:mb-2">
                    Export format:
                  </p>
                  <div className="flex flex-wrap gap-2 max-md:flex-col max-md:gap-2">
                    {section.formats.map((format) => {
                      const key = `${section.id}-${format}`;
                      const isLoading = exporting[key];
                      const needsColumnSelector =
                        section.id === "players" &&
                        (format === "xlsx" || format === "csv");

                      return (
                        <button
                          key={format}
                          onClick={() =>
                            needsColumnSelector
                              ? openColumnSelector(section.id, format)
                              : handleExport(section.id, format)
                          }
                          disabled={isLoading}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-11 max-md:min-h-11 max-md:w-full max-md:px-3 max-md:py-2.5 max-md:text-xs ${formatColors[format]}`}
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                          ) : (
                            formatIcons[format]
                          )}
                          <span className="whitespace-nowrap">
                            {isLoading
                              ? "Exporting..."
                              : `Export ${format.toUpperCase()}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full Export (Super Admin Only) - Lighter visual treatment */}
      {coach?.role === "SUPER_ADMIN" && (
        <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-5 max-md:p-3 max-md:mt-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-md:gap-2.5">
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 max-md:text-sm">
                Full System Export
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-md:text-[11px] max-md:mt-0.5">
                Download all data sections combined.
              </p>
            </div>
            {/* Buttons - Stacked vertically on mobile */}
            <div className="flex gap-2 w-full sm:w-auto max-md:flex-col max-md:gap-2">
              <button
                onClick={() => handleExport("all/combined", "json")}
                disabled={exporting["all/combined-json"]}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 active:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2 min-h-11 transition-colors max-md:text-xs max-md:px-3 max-md:min-h-11"
              >
                {exporting["all/combined-json"] ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  formatIcons.json
                )}
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => handleExport("all/combined", "csv")}
                disabled={exporting["all/combined-csv"]}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-2 min-h-11 transition-colors max-md:text-xs max-md:px-3 max-md:min-h-11"
              >
                {exporting["all/combined-csv"] ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  formatIcons.csv
                )}
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Selector Modal - Optimized for 370px */}
      {showColumnSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header - Compact */}
            <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight max-md:text-sm">
                Select Columns
              </h2>
              <p className="text-[11px] sm:text-sm text-gray-600 mt-0.5 max-md:text-[10px]">
                Choose columns for{" "}
                {pendingExport?.format?.toUpperCase() || "export"}
              </p>
            </div>

            {/* Column Selection Area */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4">
              {/* Controls - Compact */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <button
                    onClick={selectAllColumns}
                    className="text-[11px] sm:text-sm text-blue-600 hover:text-blue-700 font-semibold px-2 sm:px-3 py-1 rounded-md hover:bg-blue-50 transition-colors active:bg-blue-100"
                  >
                    All
                  </button>
                  <button
                    onClick={clearAllColumns}
                    className="text-[11px] sm:text-sm text-gray-600 hover:text-gray-700 font-semibold px-2 sm:px-3 py-1 rounded-md hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-[11px] sm:text-sm text-gray-600">
                  <span className="font-bold text-gray-900">
                    {selectedColumns.length}
                  </span>{" "}
                  selected
                </div>
              </div>

              {/* Column Checkboxes - Compact with proper touch targets */}
              <div className="space-y-1.5">
                {PLAYER_COLUMNS.map((column) => {
                  const isSelected = selectedColumns.includes(column.field);
                  return (
                    <label
                      key={column.field}
                      className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all min-h-11 max-md:min-h-11 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleColumn(column.field)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isSelected ? "text-blue-900" : "text-gray-700"
                        }`}
                      >
                        {column.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Helper Note - Compact */}
              <div className="mt-2.5 sm:mt-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[10px] sm:text-xs text-gray-600">
                  Note: Only selected fields will be included.
                </p>
              </div>
            </div>

            {/* Modal Footer - Stacked buttons */}
            <div className="px-3 sm:px-5 py-3 border-t border-gray-200 bg-gray-50 flex flex-col-reverse gap-2">
              <button
                onClick={cancelColumnSelection}
                className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-11 max-md:text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmExport}
                disabled={selectedColumns.length === 0}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-11 max-md:text-xs"
              >
                {pendingExport?.format && formatIcons[pendingExport.format]}
                Export to {pendingExport?.format?.toUpperCase() || "File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExportCenter;
