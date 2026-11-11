import { useState } from "react";
import { apiService, API_ENDPOINTS, REPORT_TIMEOUT } from "../../services/api";

/**
 * ReportGenerator Component
 * Allows super admins to generate and send audit log reports
 */
const ReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error
  const [showCustom, setShowCustom] = useState(false);
  const [selectedRange, setSelectedRange] = useState(""); // "3", "7", "15", "30", "custom"
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleQuickRange = async (days) => {
    setSelectedRange(days.toString());
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      setLoading(true);
      const response = await apiService.post(API_ENDPOINTS.AUDIT_REPORT_CUSTOM, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }, REPORT_TIMEOUT);
      
      showMessage(
        `Report sent successfully! (${response.data.logsIncluded} logs sent to ${response.data.emailsSent} recipient(s))`,
        "success"
      );
    } catch (error) {
      console.error("Error generating range report:", error);
      showMessage(`${error.message || "Failed to generate report"}`, "error");
    } finally {
      setLoading(false);
      setSelectedRange("");
    }
  };

  const handleCurrentMonthReport = async () => {
    try {
      setLoading(true);
      const response = await apiService.post(API_ENDPOINTS.AUDIT_REPORT_CURRENT_MONTH, {}, REPORT_TIMEOUT);
      
      showMessage(
        `${response.message} (${response.data.logsIncluded} logs sent to ${response.data.emailsSent} recipient(s))`,
        "success"
      );
    } catch (error) {
      console.error("Error generating current month report:", error);
      showMessage(`${error.message || "Failed to generate report"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTestCleanup = async () => {
    try {
      setLoading(true);
      const response = await apiService.post(API_ENDPOINTS.AUDIT_REPORT_TEST_CLEANUP, {}, REPORT_TIMEOUT);
      
      const { logsFound, emailsSent, testMode } = response.data;
      showMessage(
        `Test completed! Found ${logsFound} logs older than 30 days. Report sent to ${emailsSent} recipient(s). ${testMode ? "(Test mode: No logs deleted)" : ""}`,
        "success"
      );
    } catch (error) {
      console.error("Error testing cleanup:", error);
      showMessage(`${error.message || "Failed to test cleanup"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomReport = async () => {
    if (!customDates.startDate || !customDates.endDate) {
      showMessage("Please select both start and end dates", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post(API_ENDPOINTS.AUDIT_REPORT_CUSTOM, {
        startDate: customDates.startDate,
        endDate: customDates.endDate,
      }, REPORT_TIMEOUT);
      
      showMessage(
        `${response.message} (${response.data.logsIncluded} logs sent to ${response.data.emailsSent} recipient(s))`,
        "success"
      );
      
      // Reset custom dates
      setCustomDates({ startDate: "", endDate: "" });
      setShowCustom(false);
    } catch (error) {
      console.error("Error generating custom report:", error);
      showMessage(`${error.message || "Failed to generate report"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Audit Report Generator
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Generate and email PDF reports with detailed audit logs to all super admins
          </p>
        </div>
        <div className="hidden sm:block text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 whitespace-nowrap">
          Auto-cleanup: Every 30 days
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            messageType === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm">{message}</p>
            <button
              onClick={() => setMessage("")}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick Range Buttons */}
      <div className="mb-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Quick Date Ranges</h3>
        <div className="grid grid-cols-2 sm:flex gap-2">
          {[3, 7, 15, 30].map(days => (
            <button
              key={days}
              onClick={() => handleQuickRange(days)}
              disabled={loading}
              className={`px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRange === days.toString()
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50"
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Report Buttons */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Current Month Report */}
        <button
          onClick={handleCurrentMonthReport}
          disabled={loading}
          className="flex flex-col items-start p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Current Month</span>
          </div>
          <p className="text-xs text-gray-600 text-left">
            Generate report for the current month and send via email
          </p>
        </button>

        {/* Custom Date Range */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          disabled={loading}
          className={`flex flex-col items-start p-3 sm:p-4 border-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            showCustom
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm sm:text-base font-semibold text-gray-900">Custom Range</span>
          </div>
          <p className="text-xs text-gray-600 text-left">
            Select custom date range for the report
          </p>
        </button>
      </div>

      {/* Custom Date Range Inputs */}
      {showCustom && (
        <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customDates.startDate}
                onChange={(e) =>
                  setCustomDates({ ...customDates, startDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customDates.endDate}
                onChange={(e) =>
                  setCustomDates({ ...customDates, endDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleCustomReport}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs sm:text-sm text-gray-700">Generating report and sending emails...</span>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-2.5 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Reports include summary statistics, login activity, and detailed audit logs. 
          PDF reports are sent to all active super admins. If the requested date range contains no data, 
          the report will show only the available data range. The system automatically deletes logs older 
          than 30 days daily at 2:00 AM after sending the final report.
        </p>
      </div>
    </div>
  );
};

export default ReportGenerator;
