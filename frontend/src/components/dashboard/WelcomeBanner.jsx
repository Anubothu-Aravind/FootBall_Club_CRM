/**
 * WelcomeBanner Component
 * Clean welcome section for football academy dashboard
 * Optimized for users aged 45-50 with high readability
 */
const WelcomeBanner = ({ coach }) => {
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good Morning"
      : now.getHours() < 17
        ? "Good Afternoon"
        : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
            {greeting}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, Coach
          </h1>
        </div>
        <div className="sm:text-right">
          <p className="text-xs sm:text-sm text-gray-700 font-medium">
            {dateStr}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
