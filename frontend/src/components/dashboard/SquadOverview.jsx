import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

/**
 * SquadOverview Component
 * Modern analytics dashboard for football academy management
 * Optimized for users aged 45-50 with clear visuals and high readability
 */
const SquadOverview = ({ analytics, loading }) => {
  if (!analytics && !loading) return null;

  // Blue color palette for age distribution chart
  const BLUE_COLORS = [
    "#1E3A8A", // Deep blue
    "#2563EB", // Blue
    "#3B82F6", // Light blue
    "#60A5FA", // Lighter blue
    "#93C5FD", // Very light blue
    "#DBEAFE", // Pale blue
    "#1E40AF", // Dark blue variant
    "#1D4ED8", // Another blue variant
  ];

  // Prepare data for charts
  const ageChartData = analytics
    ? Object.entries(analytics.ageGroups)
        .filter(([, count]) => count > 0)
        .sort((a, b) => {
          const numA = parseInt(a[0].replace(/\D/g, "")) || 999;
          const numB = parseInt(b[0].replace(/\D/g, "")) || 999;
          return numA - numB;
        })
        .map(([group, count]) => ({
          name: group,
          value: count,
        }))
    : [];

  const genderData = analytics
    ? [
        { name: "Boys", value: analytics.genderCount.Male, fill: "#3B82F6" },
        { name: "Girls", value: analytics.genderCount.Female, fill: "#60A5FA" },
      ]
    : [];

  const totalPlayers = analytics
    ? analytics.genderCount.Male + analytics.genderCount.Female
    : 0;

  const tournamentTotal = analytics
    ? analytics.tournamentStatus.Upcoming +
      analytics.tournamentStatus.Ongoing +
      analytics.tournamentStatus.Completed
    : 0;

  // Calculate percentages for tournament status bar
  const upcomingPercent =
    tournamentTotal > 0
      ? (analytics.tournamentStatus.Upcoming / tournamentTotal) * 100
      : 0;
  const activePercent =
    tournamentTotal > 0
      ? (analytics.tournamentStatus.Ongoing / tournamentTotal) * 100
      : 0;
  const completedPercent =
    tournamentTotal > 0
      ? (analytics.tournamentStatus.Completed / tournamentTotal) * 100
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {loading ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : analytics ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Total Players */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Total Players
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                {analytics.totals.players}
              </div>
            </div>

            {/* Active Tournaments */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Active Tournaments
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                {analytics.totals.tournaments}
              </div>
            </div>

            {/* Staff Members */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Staff Members
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                {analytics.totals.admins}
              </div>
            </div>
          </div>

          {/* Analytics Section - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Age Distribution Chart */}
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Age Distribution
              </h3>
              <p className="text-sm sm:text-base lg:text-sm text-gray-600 mb-1">
                Total: {totalPlayers} players
              </p>
              <p className="text-xs sm:text-sm lg:text-xs text-gray-500 mb-3 sm:mb-4">
                Distribution by age group
              </p>
              <ResponsiveContainer
                width="100%"
                height={240}
                className="sm:!h-[280px]"
              >
                <PieChart>
                  <Pie
                    data={ageChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      // Simplified labels on small screens to prevent overlap
                      if (typeof window !== 'undefined' && window.innerWidth < 640) {
                        return `${entry.value}`;
                      }
                      return `${entry.name}: ${entry.value}`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ageChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BLUE_COLORS[index % BLUE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                    formatter={(value, name) => [`${value} players`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Distribution Chart */}
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Gender Distribution
              </h3>
              <p className="text-sm sm:text-base lg:text-sm text-gray-600 mb-1">
                Total: {totalPlayers} players
              </p>
              <p className="text-xs sm:text-sm lg:text-xs text-gray-500 mb-3 sm:mb-4">
                Male and female breakdown
              </p>
              <ResponsiveContainer
                width="100%"
                height={240}
                className="sm:!h-[280px]"
              >
                <BarChart
                  data={genderData}
                  layout="vertical"
                  margin={{ top: 15, right: 20, left: 10, bottom: 15 }}
                >
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 13, fontWeight: 600 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tournament Status - Stacked Progress Bar */}
          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              Tournament Status
            </h3>
            <p className="text-sm sm:text-base lg:text-sm text-gray-600 mb-3 sm:mb-4">
              Total: {tournamentTotal} tournaments
            </p>

            {/* Status counts */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-1.5">
                  {analytics.tournamentStatus.Upcoming}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700">
                  Upcoming
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-1.5">
                  {analytics.tournamentStatus.Ongoing}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700">
                  Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-1.5">
                  {analytics.tournamentStatus.Completed}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700">
                  Completed
                </div>
              </div>
            </div>

            {/* Stacked progress bar */}
            <div className="relative h-8 sm:h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-yellow-400 transition-all flex items-center justify-center text-[10px] sm:text-xs font-semibold text-gray-900"
                style={{ width: `${upcomingPercent}%` }}
              >
                {upcomingPercent > 10 && `${Math.round(upcomingPercent)}%`}
              </div>
              <div
                className="absolute top-0 h-full bg-green-500 transition-all flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white"
                style={{
                  left: `${upcomingPercent}%`,
                  width: `${activePercent}%`,
                }}
              >
                {activePercent > 10 && `${Math.round(activePercent)}%`}
              </div>
              <div
                className="absolute right-0 top-0 h-full bg-gray-400 transition-all flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white"
                style={{ width: `${completedPercent}%` }}
              >
                {completedPercent > 10 && `${Math.round(completedPercent)}%`}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">
                  Upcoming
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">Active</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-8 sm:p-10 lg:p-12 text-center border border-gray-200 shadow-sm">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-700 text-lg font-medium">
            Unable to load squad information.
          </p>
        </div>
      )}
    </div>
  );
};

export default SquadOverview;
