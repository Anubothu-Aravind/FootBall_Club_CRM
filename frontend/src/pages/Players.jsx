import { useState, useEffect, useMemo } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PlayersHeroBanner from "../components/player-browse/PlayersHeroBanner";
import PlayersFilters from "../components/player-browse/PlayersFilters";
import PlayersGroupedList from "../components/player-browse/PlayersGroupedList";
import PlayerTableSkeleton from "../components/skeletons/PlayerTableSkeleton";

/**
 * Normalize age group format (U-16 -> U16)
 */
const normalizeAgeGroup = (group) => {
  if (!group) return "";
  return group.replace(/^U-/, "U");
};

/**
 * Check if player's age group is younger than or equal to selected group
 */
const isAgeGroupYoungerOrEqual = (playerGroup, selectedGroup) => {
  if (!selectedGroup || selectedGroup === "All") return true;
  if (!playerGroup) return false;

  const normPlayerGroup = normalizeAgeGroup(playerGroup);
  const normSelectedGroup = normalizeAgeGroup(selectedGroup);

  if (normPlayerGroup === normSelectedGroup) return true;

  const getGroupValue = (g) => {
    if (g === "Senior") return 999;
    const match = g.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  return getGroupValue(normPlayerGroup) <= getGroupValue(normSelectedGroup);
};

/**
 * Players Page - Player Directory
 * Displays players grouped by age group with filter pills.
 * Matches the Figma design: hero banner > filters > grouped tables.
 */
const Players = () => {
  const { coach } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.PLAYERS);
        const playersList = Array.isArray(data) ? data : data.players || [];
        setPlayers(playersList);
      } catch (err) {
        setError(err.message || "Failed to load players.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Derive unique age groups from data
  const ageGroups = useMemo(() => {
    const groups = [
      ...new Set(players.map((p) => normalizeAgeGroup(p.age_group))),
    ];
    // Sort age groups numerically (extract number)
    groups.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
    return groups;
  }, [players]);

  // Map backend gender to display label
  const genderLabel = (g) => {
    if (!g) return "";
    const lower = g.toLowerCase();
    if (lower === "male" || lower === "boys" || lower === "boy") return "Boys";
    if (lower === "female" || lower === "girls" || lower === "girl")
      return "Girls";
    return g;
  };

  // Helper to get player name
  const getPlayerName = (player) => {
    if (player.name) return player.name;
    return (
      `${player.first_name || ""} ${player.last_name || ""}`.trim() || "Unknown"
    );
  };

  // Filter players
  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchAge = isAgeGroupYoungerOrEqual(p.age_group, selectedAgeGroup);
      const matchGender =
        selectedGender === "All" || genderLabel(p.gender) === selectedGender;
      const matchSearch =
        searchTerm === "" ||
        getPlayerName(p).toLowerCase().includes(searchTerm.toLowerCase());
      return matchAge && matchGender && matchSearch;
    });
  }, [players, selectedAgeGroup, selectedGender, searchTerm]);

  // Sort players: selected age group first, then younger groups in descending order
  const sortedPlayers = useMemo(() => {
    const getGroupValue = (group) => {
      if (!group) return 0;
      const normalized = normalizeAgeGroup(group);
      if (normalized === "Senior") return 999;
      const match = normalized.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    const sorted = [...filtered];

    if (selectedAgeGroup === "All") {
      // Default: sort from youngest to oldest
      sorted.sort((a, b) => {
        const valA = getGroupValue(a.age_group);
        const valB = getGroupValue(b.age_group);
        return valA - valB;
      });
    } else {
      // Selected age group first, then younger groups in descending order
      const selectedValue = getGroupValue(selectedAgeGroup);
      sorted.sort((a, b) => {
        const valA = getGroupValue(a.age_group);
        const valB = getGroupValue(b.age_group);

        // Selected age group always comes first
        if (valA === selectedValue && valB !== selectedValue) return -1;
        if (valB === selectedValue && valA !== selectedValue) return 1;

        // Both are selected age group or neither - sort descending (older first)
        return valB - valA;
      });
    }

    return sorted;
  }, [filtered, selectedAgeGroup]);

  // Position color mapping
  const positionColor = (pos) => {
    if (!pos) return "text-gray-600";
    const lower = pos.toLowerCase();
    if (lower.includes("forward")) return "text-red-600";
    if (lower.includes("midfielder") || lower.includes("midfield"))
      return "text-blue-600";
    if (lower.includes("defender") || lower.includes("defense"))
      return "text-green-700";
    if (lower.includes("goalkeeper") || lower.includes("keeper"))
      return "text-amber-600";
    return "text-red-600";
  };

  const genderColor = (g) => {
    const label = genderLabel(g);
    return label === "Girls" ? "text-red-500" : "text-blue-600";
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PlayersHeroBanner playerCount={filtered.length} />

      <div className="max-w-5xl mx-auto px-6 py-10 max-md:px-4 max-md:py-6">
        {loading ? (
          <PlayerTableSkeleton rows={12} showFilters={true} />
        ) : (
          <>
            <PlayersFilters
              ageGroups={ageGroups}
              selectedAgeGroup={selectedAgeGroup}
              setSelectedAgeGroup={setSelectedAgeGroup}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredCount={filtered.length}
            />

            <PlayersGroupedList
              players={sortedPlayers}
              genderLabel={genderLabel}
              positionColor={positionColor}
              genderColor={genderColor}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Players;
