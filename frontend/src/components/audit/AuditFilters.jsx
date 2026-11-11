import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../../services/api";

/**
 * AuditFilters Component
 * Filter controls for audit logs
 */
const AuditFilters = ({ filters, onFilterChange, onReset }) => {
  const [enums, setEnums] = useState({
    actions: [],
    categories: [],
    severities: [],
    entityTypes: [],
  });

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.AUDIT_ENUMS);
        setEnums(data);
      } catch (error) {
        console.error("Failed to fetch enums:", error);
      }
    };
    fetchEnums();
  }, []);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Search descriptions, names..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Severity
          </label>
          <select
            value={filters.severity || ""}
            onChange={(e) => handleChange("severity", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All</option>
            {enums.severities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Category
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All</option>
            {enums.categories.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Action */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Action
          </label>
          <select
            value={filters.action || ""}
            onChange={(e) => handleChange("action", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All</option>
            {enums.actions.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Entity Type
          </label>
          <select
            value={filters.entityType || ""}
            onChange={(e) => handleChange("entityType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All</option>
            {enums.entityTypes.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Actor Email */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Actor Email
          </label>
          <input
            type="text"
            value={filters.actorEmail || ""}
            onChange={(e) => handleChange("actorEmail", e.target.value)}
            placeholder="Filter by actor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;
