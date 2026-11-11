/**
 * AuditStatsCards Component
 * Displays audit statistics in card format
 */
const AuditStatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Today's Actions",
      value: stats.today?.total || 0,
      icon: "#",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600",
    },
    {
      label: "Critical Events",
      value: stats.today?.bySeverity?.CRITICAL || 0,
      icon: "!!",
      color: "bg-red-50 border-red-200",
      textColor: "text-red-600",
    },
    {
      label: "Warnings",
      value: stats.today?.bySeverity?.WARNING || 0,
      icon: "!",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-600",
    },
    {
      label: "Auth Events",
      value: stats.today?.byCategory?.AUTHENTICATION || 0,
      icon: "Auth",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`rounded-lg border p-3 md:p-4 ${card.color}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl md:text-2xl">{card.icon}</span>
            <span className={`text-xl md:text-2xl font-bold ${card.textColor}`}>
              {card.value}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * ActivityChart Component
 * Clustered bar chart for activity trends by severity
 */
export const ActivityChart = ({ trends }) => {
  if (!trends || !trends.labels || trends.labels.length === 0) {
    return null;
  }

  // Define datasets for clustered bars (by severity)
  const datasets = [
    {
      label: 'Critical',
      data: trends.critical || trends.labels.map(() => 0),
      color: 'bg-red-500',
      borderColor: 'border-red-600',
    },
    {
      label: 'Warning',
      data: trends.warning || trends.labels.map(() => 0),
      color: 'bg-orange-400',
      borderColor: 'border-orange-500',
    },
    {
      label: 'Info',
      data: trends.info || trends.labels.map(() => 0),
      color: 'bg-blue-400',
      borderColor: 'border-blue-500',
    },
  ];

  // If old format (single data array), convert it
  if (trends.data && !trends.critical) {
    datasets[0].data = trends.data;
    datasets[1].data = trends.labels.map(() => 0);
    datasets[2].data = trends.labels.map(() => 0);
  }

  // Calculate max value across all datasets
  const allValues = datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues, 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Activity Trend (Last 7 Days)
      </h3>
      
      {/* Legend */}
      <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-3">
        {datasets.map((dataset, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded ${dataset.color}`}></div>
            <span className="text-xs text-gray-600">{dataset.label}</span>
          </div>
        ))}
      </div>

      {/* Clustered Bar Chart */}
      <div className="flex items-end justify-between h-28 md:h-32 gap-2 md:gap-3">
        {trends.labels.map((label, labelIndex) => (
          <div key={labelIndex} className="flex-1 flex flex-col items-center gap-1.5 md:gap-2">
            {/* Bars container */}
            <div className="w-full flex items-end justify-center gap-0.5 h-20 md:h-24">
              {datasets.map((dataset, datasetIndex) => {
                const value = dataset.data[labelIndex] || 0;
                const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div
                    key={datasetIndex}
                    className={`flex-1 ${dataset.color} rounded-t transition-all duration-300 relative group cursor-pointer`}
                    style={{ 
                      height: `${heightPercent}%`,
                      minHeight: value > 0 ? '3px' : '0px',
                      maxWidth: '16px'
                    }}
                    title={`${dataset.label}: ${value}`}
                  >
                    {/* Tooltip on hover */}
                    {value > 0 && (
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Label */}
            <span className="text-[10px] md:text-xs text-gray-500 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * TopActors Component
 * Displays most active users
 */
export const TopActors = ({ actors }) => {
  if (!actors || actors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Most Active Users (7 Days)
      </h3>
      <div className="space-y-2">
        {actors.map((actor, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs md:text-sm font-medium text-gray-500 shrink-0">
                #{index + 1}
              </span>
              <span className="text-xs md:text-sm text-gray-700 truncate">
                {actor.email || "System"}
              </span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-red-600 shrink-0">
              {actor.actions}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditStatsCards;
