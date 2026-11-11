import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../../services/api";
import TrainingCardSkeleton from "../skeletons/TrainingCardSkeleton";

const TrainingsSection = ({ compact = false, hideCompleted = false }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.TRAININGS);
        const list = Array.isArray(data) ? data : data.trainings || [];
        setTrainings(list);
      } catch (error) {
        // Silently fail and show empty state
        console.error("Failed to fetch trainings:", error);
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  /**
   * Format a date string from ISO date.
   */
  const formatDate = (dateStr) => {
    try {
      const opts = { month: "long", day: "numeric", year: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-US", opts);
    } catch {
      return "";
    }
  };

  /**
   * Format duration in minutes to readable format
   */
  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  /**
   * Group trainings by status
   */
  const groupedTrainings = {
    Ongoing: trainings.filter((t) => t.status?.toLowerCase() === "ongoing"),
    Scheduled: trainings.filter((t) => t.status?.toLowerCase() === "scheduled"),
    Completed: hideCompleted
      ? []
      : trainings.filter((t) => t.status?.toLowerCase() === "completed"),
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const styles = {
      ongoing: "bg-green-600 text-white",
      scheduled: "bg-blue-600 text-white",
      completed: "bg-gray-500 text-white",
      cancelled: "bg-red-600 text-white",
    };
    return styles[status?.toLowerCase()] || "bg-gray-600 text-white";
  };

  /**
   * Get type badge styling
   */
  const getTypeBadge = (type) => {
    const styles = {
      technical: "bg-purple-100 text-purple-700",
      tactical: "bg-blue-100 text-blue-700",
      physical: "bg-red-100 text-red-700",
      mental: "bg-indigo-100 text-indigo-700",
      goalkeeper: "bg-yellow-100 text-yellow-700",
      "team building": "bg-green-100 text-green-700",
    };
    return styles[type?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  /**
   * Render training cards for a specific status
   */
  const renderTrainingCards = (trainingList, statusType) => {
    if (trainingList.length === 0) return null;

    return (
      <div className="mb-10 last:mb-0 max-md:mb-8 max-[480px]:mb-6">
        {/* Status Section Header */}
        <div className="mb-4 max-md:mb-3.5">
          <h3 className="text-xl font-bold text-gray-900 m-0 flex items-center gap-2.5 max-md:text-lg max-[480px]:text-base">
            {statusType}
            <span className="text-sm font-normal text-gray-500 max-[480px]:text-xs">
              ({trainingList.length})
            </span>
          </h3>
        </div>

        {/* Training Cards Grid - Responsive 2-3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-md:gap-4">
          {trainingList.map((training, index) => (
            <div
              key={training.id || training._id || index}
              className="bg-white rounded-xl p-5 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.12)] max-md:p-4 max-md:hover:scale-[1.01] max-[480px]:p-3.5 animate-fade-in shadow-md"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status & Type Badges */}
              <div className="mb-4 flex gap-2 flex-wrap">
                <span
                  className={`inline-block py-1.5 px-3.5 text-xs font-semibold rounded-full max-[480px]:text-[11px] max-[480px]:py-[5px] max-[480px]:px-2.5 ${getStatusBadge(training.status)}`}
                >
                  {training.status}
                </span>
                <span
                  className={`inline-block py-1.5 px-3.5 text-xs font-semibold rounded-full max-[480px]:text-[11px] max-[480px]:py-[5px] max-[480px]:px-2.5 ${getTypeBadge(training.type)}`}
                >
                  {training.type}
                </span>
              </div>

              {/* Training Title */}
              <h4 className="text-lg font-bold text-gray-900 m-0 mb-4 line-clamp-2 max-[480px]:text-base">
                {training.title}
              </h4>

              {/* Training Details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-sm text-gray-600 max-[480px]:text-[13px]">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600"
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
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">
                      Age Group:
                    </span>{" "}
                    <span>{training.age_group}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 max-[480px]:text-[13px]">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600"
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
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">Date:</span>{" "}
                    <span>{formatDate(training.session_date)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 max-[480px]:text-[13px]">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">
                      Duration:
                    </span>{" "}
                    <span>{formatDuration(training.duration)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 max-[480px]:text-[13px]">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">
                      Location:
                    </span>{" "}
                    <span>{training.location}</span>
                  </div>
                </div>
                {training.coach_name && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 max-[480px]:text-[13px]">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600"
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
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">
                        Coach:
                      </span>{" "}
                      <span>{training.coach_name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    if (compact) {
      return (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 max-md:text-xl">
            Training Sessions
          </h3>
          <TrainingCardSkeleton count={3} />
        </div>
      );
    }
    return (
      <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 px-6 max-lg:py-10 max-lg:px-6 max-md:py-8 max-md:px-5 max-[480px]:py-6 max-[480px]:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center max-md:mb-6 max-[480px]:mb-5">
            <h2 className="text-3xl font-bold text-gray-900 m-0 mb-2 max-md:text-2xl max-[480px]:text-xl">
              Training Sessions
            </h2>
            <p className="text-gray-600 text-base m-0 max-md:text-sm max-[480px]:text-xs">
              Loading training sessions…
            </p>
          </div>
          <TrainingCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  if (compact) {
    const allTrainings = [
      ...groupedTrainings.Ongoing,
      ...groupedTrainings.Scheduled,
      ...groupedTrainings.Completed,
    ].slice(0, 4);

    if (allTrainings.length === 0) {
      return (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 max-md:text-xl">
            Training Sessions
          </h3>
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-sm">
              No training sessions available
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 max-md:text-xl">
          Training Sessions
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {trainings.length} session{trainings.length !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-1 gap-4">
          {allTrainings.map((training, index) => (
            <div
              key={training.id || training._id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:border-red-600"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-base font-bold text-gray-900 line-clamp-1 flex-1">
                  {training.title}
                </h4>
                <div className="flex gap-1 ml-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getTypeBadge(training.type)}`}
                  >
                    {training.type}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadge(training.status)}`}
                  >
                    {training.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-red-600"
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
                  <span>{training.age_group}</span>
                  <span className="mx-1">•</span>
                  <svg
                    className="w-3.5 h-3.5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{formatDuration(training.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="line-clamp-1">{training.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        {/* Grouped Training Sections - Divided with subtle spacing */}
        <div>
          {renderTrainingCards(
            groupedTrainings.Ongoing,
            "Ongoing Training Sessions",
          )}
          {renderTrainingCards(
            groupedTrainings.Scheduled,
            "Scheduled Training Sessions",
          )}
          {renderTrainingCards(
            groupedTrainings.Completed,
            "Completed Training Sessions",
          )}
        </div>

        {/* Empty State */}
        {trainings.length === 0 && !loading && (
          <div className="text-center py-20 max-md:py-16 max-[480px]:py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 max-[480px]:text-lg">
              No Training Sessions Available
            </h3>
            <p className="text-gray-600 max-[480px]:text-sm">
              Check back soon for upcoming training sessions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingsSection;
