import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../../services/api";
import TournamentCardSkeleton from "../skeletons/TournamentCardSkeleton";

const TournamentsSection = ({ compact = false }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static fallback data
  // const staticTournaments = [
  //   {
  //     name: "Spring Championship 2026",
  //     age_group: "Under 13",
  //     start_date: "2026-03-15",
  //     end_date: "2026-03-20",
  //     location: "Anantapur Sports Complex",
  //     status: "Upcoming",
  //   },
  //   {
  //     name: "Regional Youth Cup",
  //     age_group: "Under 16",
  //     start_date: "2026-04-05",
  //     end_date: "2026-04-12",
  //     location: "District Stadium",
  //     status: "Upcoming",
  //   },
  //   {
  //     name: "State Premier League",
  //     age_group: "Under 19",
  //     start_date: "2026-05-01",
  //     end_date: "2026-05-31",
  //     location: "Multiple Venues",
  //     status: "Upcoming",
  //   },
  //   {
  //     name: "Junior Skills Tournament",
  //     age_group: "Under 8",
  //     start_date: "2026-02-28",
  //     end_date: "2026-02-28",
  //     location: "Anantapur Sports Complex",
  //     status: "Upcoming",
  //   },
  // ];

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.TOURNAMENTS);
        const list = Array.isArray(data) ? data : data.tournaments || [];
        setTournaments(list.length > 0 ? list : staticTournaments);
      } catch {
        // Silently fall back to static data on error
        setTournaments(staticTournaments);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  /**
   * Format a date range string from ISO dates.
   */
  const formatDates = (start, end) => {
    try {
      const opts = { month: "long", day: "numeric", year: "numeric" };
      const s = new Date(start).toLocaleDateString("en-US", opts);
      const e = new Date(end).toLocaleDateString("en-US", opts);
      return s === e ? s : `${s} – ${e}`;
    } catch {
      return "";
    }
  };

  /**
   * Group tournaments by status
   */
  const groupedTournaments = {
    Ongoing: tournaments.filter((t) => t.status?.toLowerCase() === "ongoing"),
    Upcoming: tournaments.filter((t) => t.status?.toLowerCase() === "upcoming"),
    Completed: tournaments.filter(
      (t) => t.status?.toLowerCase() === "completed",
    ),
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const styles = {
      ongoing: "bg-green-600 text-white",
      upcoming: "bg-blue-600 text-white",
      completed: "bg-gray-500 text-white",
    };
    return styles[status?.toLowerCase()] || "bg-red-600 text-white";
  };

  /**
   * Render tournament cards for a specific status
   */
  const renderTournamentCards = (tournamentList, statusType) => {
    if (tournamentList.length === 0) return null;

    return (
      <div className="mb-10 last:mb-0 max-md:mb-8 max-[480px]:mb-6">
        {/* Status Section Header */}
        <div className="mb-4 max-md:mb-3.5">
          <h3 className="text-xl font-bold text-gray-900 m-0 flex items-center gap-2.5 max-md:text-lg max-[480px]:text-base">
            {statusType}
            <span className="text-sm font-normal text-gray-500 max-[480px]:text-xs">
              ({tournamentList.length})
            </span>
          </h3>
        </div>

        {/* Tournament Cards Grid - Responsive 2-3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-md:gap-4">
          {tournamentList.map((tournament, index) => (
            <div
              key={tournament.id || tournament._id || index}
              className="bg-white rounded-xl p-5 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.12)] max-md:p-4 max-md:hover:scale-[1.01] max-[480px]:p-3.5 animate-fade-in shadow-md"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block py-1.5 px-3.5 text-xs font-semibold rounded-full max-[480px]:text-[11px] max-[480px]:py-[5px] max-[480px]:px-2.5 ${getStatusBadge(tournament.status)}`}
                >
                  {tournament.status}
                </span>
              </div>

              {/* Tournament Title */}
              <h4 className="text-lg font-bold text-gray-900 m-0 mb-4 line-clamp-2 max-[480px]:text-base">
                {tournament.name}
              </h4>

              {/* Tournament Details */}
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
                    <span>{tournament.age_group}</span>
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
                    <span className="font-semibold text-gray-800">Dates:</span>{" "}
                    <span>
                      {formatDates(tournament.start_date, tournament.end_date)}
                    </span>
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
                    <span>{tournament.location}</span>
                  </div>
                </div>
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
            Tournaments
          </h3>
          <TournamentCardSkeleton count={3} />
        </div>
      );
    }
    return (
      <section className="w-full bg-gradient-to-b from-orange-50/30 to-white py-12 px-6 max-lg:py-10 max-lg:px-6 max-md:py-8 max-md:px-5 max-[480px]:py-6 max-[480px]:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center max-md:mb-6 max-[480px]:mb-5">
            <h2 className="text-3xl font-bold text-gray-900 m-0 mb-2 max-md:text-2xl max-[480px]:text-xl">
              Tournaments
            </h2>
            <p className="text-gray-600 text-base m-0 max-md:text-sm max-[480px]:text-xs">
              Loading tournaments…
            </p>
          </div>
          <TournamentCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  if (compact) {
    return (
      <div>
        {/* Compact Header */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2 max-md:text-xl">
          Tournaments
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""}
        </p>

        {/* Grouped Tournament Sections */}
        <div className="space-y-4">
          {renderTournamentCards(
            groupedTournaments.Ongoing,
            "Ongoing Tournaments",
          )}
          {renderTournamentCards(
            groupedTournaments.Upcoming,
            "Upcoming Tournaments",
          )}
          {renderTournamentCards(
            groupedTournaments.Completed,
            "Completed Tournaments",
          )}
        </div>

        {/* Empty State */}
        {tournaments.length === 0 && !loading && (
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
              No Tournaments Available
            </h3>
            <p className="text-gray-600 max-[480px]:text-sm">
              Check back soon for upcoming tournaments
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        {/* Grouped Tournament Sections - Divided with subtle spacing */}
        <div>
          {renderTournamentCards(
            groupedTournaments.Ongoing,
            "Ongoing Tournaments",
          )}
          {renderTournamentCards(
            groupedTournaments.Upcoming,
            "Upcoming Tournaments",
          )}
          {renderTournamentCards(
            groupedTournaments.Completed,
            "Completed Tournaments",
          )}
        </div>

        {/* Empty State */}
        {tournaments.length === 0 && !loading && (
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
              No Tournaments Available
            </h3>
            <p className="text-gray-600 max-[480px]:text-sm">
              Check back soon for upcoming tournaments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsSection;
