/**
 * StatsSection Component
 * Displays key statistics with icons and animated counters
 */

// Default SVG icons for stats (keyed by index)
const STAT_ICONS = [
  (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
];

const DEFAULT_STATS = [
  { value: "250+", label: "Active Players" },
  { value: "12", label: "Championships Won" },
  { value: "6", label: "Years of Excellence" },
  { value: "4", label: "Upcoming Tournaments" },
];

const StatsSection = () => {
  const stats = DEFAULT_STATS;

  return (
    <section className="w-full bg-white py-16 px-16 max-lg:py-12 max-lg:px-8 max-md:py-10 max-md:px-5 max-[480px]:py-8 max-[480px]:px-4 border-b border-gray-200">
      <div className="max-w-[1152px] mx-auto">
        <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:gap-4 max-[480px]:gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl py-8 px-6 text-center transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] hover:border-red-600 max-md:py-5 max-md:px-4 max-md:hover:scale-[1.02] max-[480px]:py-4 max-[480px]:px-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="text-red-600 mb-5 flex justify-center max-[480px]:mb-3">
                {STAT_ICONS[index % STAT_ICONS.length]}
              </div>

              {/* Value */}
              <h3 className="text-[40px] font-bold text-gray-900 m-0 mb-2 max-md:text-[28px] max-[480px]:text-2xl">
                {stat.value}
              </h3>

              {/* Label */}
              <p className="text-gray-600 text-sm m-0 max-md:text-xs max-[480px]:text-[11px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
