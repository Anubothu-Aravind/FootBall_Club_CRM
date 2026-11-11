import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import SquadOverview from "../components/dashboard/SquadOverview";
import QuickActions from "../components/dashboard/QuickActions";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";

// Predefined age groups matching the player management system
const AGE_GROUPS = [
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
  "U20",
  "U23",
  "Senior",
];

/**
 * Normalize age group format (U-16 -> U16)
 */
const normalizeAgeGroup = (group) => {
  if (!group) return "";
  return group.replace(/^U-/, "U");
};

/**
 * Coach Portal Page
 * Dashboard for authenticated coaches.
 * Shows analytics (Super Admin) and quick actions.
 */
const CoachPortal = () => {
  const { coach } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data for Super Admin
  useEffect(() => {
    if (coach?.role === "SUPER_ADMIN") {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [coach]);

  const fetchAnalytics = async () => {
    try {
      const [players, tournaments, admins] = await Promise.all([
        apiService.get(API_ENDPOINTS.PLAYERS),
        apiService.get(API_ENDPOINTS.TOURNAMENTS),
        apiService.get(API_ENDPOINTS.ADMINS),
      ]);

      // Calculate analytics
      const playersList = Array.isArray(players)
        ? players
        : players.players || [];
      const tournamentsList = Array.isArray(tournaments)
        ? tournaments
        : tournaments.tournaments || [];
      const adminsList = Array.isArray(admins) ? admins : admins.admins || [];

      // Age group distribution - initialize all age groups with 0
      const ageGroups = {};
      AGE_GROUPS.forEach((group) => {
        ageGroups[group] = 0;
      });
      // Count players in each age group
      playersList.forEach((p) => {
        if (p.age_group) {
          // Normalize the age group (U-16 -> U16)
          const normalizedGroup = normalizeAgeGroup(p.age_group);
          // Try exact match first
          if (ageGroups.hasOwnProperty(normalizedGroup)) {
            ageGroups[normalizedGroup]++;
          } else {
            // If not found, add as-is to show actual data
            ageGroups[normalizedGroup] = (ageGroups[normalizedGroup] || 0) + 1;
          }
        }
      });

      // Gender distribution
      const genderCount = {
        Male: playersList.filter((p) => p.gender?.toLowerCase() === "male")
          .length,
        Female: playersList.filter((p) => p.gender?.toLowerCase() === "female")
          .length,
      };

      // Tournament status
      const tournamentStatus = {
        Upcoming: tournamentsList.filter((t) => t.status === "Upcoming").length,
        Ongoing: tournamentsList.filter((t) => t.status === "Ongoing").length,
        Completed: tournamentsList.filter((t) => t.status === "Completed")
          .length,
      };

      // Admin roles
      const adminRoles = {
        Super: adminsList.filter((a) => a.role === "SUPER_ADMIN").length,
        Regular: adminsList.filter((a) => a.role === "ADMIN").length,
      };

      setAnalytics({
        totals: {
          players: playersList.length,
          tournaments: tournamentsList.length,
          admins: adminsList.length,
        },
        ageGroups,
        genderCount,
        tournamentStatus,
        adminRoles,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Super Admin-only links
  const adminLinks =
    coach?.role === "SUPER_ADMIN"
      ? [
          {
            title: "Manage Admins",
            description:
              "Create, promote, demote, and reset passwords for coaches.",
            path: "/admin-management",
            icon: (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
          },
          {
            title: "Audit Logs",
            description: "Monitor all system activities and user actions.",
            path: "/audit-logs",
            icon: (
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
          },
          {
            title: "Deleted Records",
            description: "View and restore recently deleted data.",
            path: "/deleted-records",
            icon: (
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
          },
        ]
      : [];

  const quickLinks = [
    ...adminLinks,
    {
      title: "Manage Players",
      description: "Add, edit, and manage your full player roster.",
      path: "/manage-players",
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      title: "Manage Tournaments",
      description: "Create and organise upcoming tournaments.",
      path: "/manage-tournaments",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Manage Training",
      description: "Schedule and manage training sessions.",
      path: "/manage-trainings",
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Export Center",
      description: "Download players, tournaments, and logs data.",
      path: "/export-center",
      icon: (
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    },
    {
      title: "Jersey Likes",
      description: "View and manage jersey like analytics.",
      path: "/jersey-likes",
      icon: (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  if (loading && coach?.role === "SUPER_ADMIN") {
    return (
      <DashboardLayout title="Dashboard">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <WelcomeBanner coach={coach} />
      {coach?.role === "SUPER_ADMIN" && (
        <SquadOverview analytics={analytics} loading={loading} />
      )}
      <div className="mt-8">
        <QuickActions quickLinks={quickLinks} />
      </div>
    </DashboardLayout>
  );
};

export default CoachPortal;
