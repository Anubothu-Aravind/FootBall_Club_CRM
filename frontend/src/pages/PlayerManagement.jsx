import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PlayerManagementHeader from "../components/player-management/PlayerManagementHeader";
import ToastMessages from "../components/common/ToastMessages";
import PlayerFilters from "../components/player-management/PlayerFilters";
import PlayersTable from "../components/player-management/PlayersTable";
import PlayerFormModal from "../components/player-management/PlayerFormModal";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import PlayerTableSkeleton from "../components/skeletons/PlayerTableSkeleton";

const EMPTY_PLAYER = {
  first_name: "",
  middle_name: "",
  last_name: "",
  age: "",
  age_group: "",
  age_group_auto: true,
  gender: "Male",
  size: "",
  height: "",
  weight: "",
  jersey_no: "",
  address: "",
  city: "",
};

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
 * Auto-map age to age group
 */
const getAgeGroup = (age) => {
  const numAge = parseInt(age);
  if (isNaN(numAge)) return "";

  if (numAge <= 8) return "U8";
  if (numAge === 9) return "U9";
  if (numAge === 10) return "U10";
  if (numAge === 11) return "U11";
  if (numAge === 12) return "U12";
  if (numAge === 13) return "U13";
  if (numAge === 14) return "U14";
  if (numAge === 15) return "U15";
  if (numAge === 16) return "U16";
  if (numAge === 17) return "U17";
  if (numAge === 18) return "U18";
  if (numAge === 19) return "U19";
  if (numAge === 20) return "U20";
  if (numAge >= 21 && numAge <= 23) return "U23";
  return "Senior";
};

/**
 * PlayerManagement Page
 * Full CRUD for players - any authenticated coach can create/edit,
 * only Super Admin can delete.
 */
const PlayerManagement = () => {
  const { coach } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = coach?.role === "SUPER_ADMIN";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [filterGroup, setFilterGroup] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PLAYER);
  const [editingId, setEditingId] = useState(null); // null = create, id = edit
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ── Helpers ───────────────────────────────────────────
  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };
  const flashError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  // ── Fetch ─────────────────────────────────────────────
  const fetchPlayers = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.PLAYERS);
      const playersList = Array.isArray(data) ? data : data.players || [];
      setPlayers(playersList);
    } catch (err) {
      flashError(err.message || "Failed to load players.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // ── Helper to check if age group is younger or equal ──
  const isAgeGroupYoungerOrEqual = (playerGroup, selectedGroup) => {
    if (!selectedGroup) return true;
    if (!playerGroup) return false;

    // Normalize formats: U-16 -> U16
    const normPlayerGroup = normalizeAgeGroup(playerGroup);
    const normSelectedGroup = normalizeAgeGroup(selectedGroup);

    // If exact match
    if (normPlayerGroup === normSelectedGroup) return true;

    // Get numeric value for comparison
    const getGroupValue = (g) => {
      if (g === "Senior") return 999;
      const match = g.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    return getGroupValue(normPlayerGroup) <= getGroupValue(normSelectedGroup);
  };

  // ── Filtered list ─────────────────────────────────────
  const filtered = players.filter((p) => {
    if (filterGroup && !isAgeGroupYoungerOrEqual(p.age_group, filterGroup))
      return false;
    if (filterGender && p.gender !== filterGender) return false;
    if (searchTerm) {
      const fullName = [p.first_name, p.middle_name, p.last_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!fullName.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  // ── Pagination ────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPlayers = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGroup, filterGender, searchTerm]);

  // ── Open form ─────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_PLAYER);
    setShowForm(true);
  };
  const openEdit = (player) => {
    setEditingId(player.id || player._id);
    setFormData({
      first_name: player.first_name || "",
      middle_name: player.middle_name || "",
      last_name: player.last_name || "",
      age: player.age ?? "",
      age_group: player.age_group || "",
      gender: player.gender || "Male",
      size: player.size || "",
      height: player.height ?? "",
      weight: player.weight ?? "",
      jersey_no: player.jersey_no ?? "",
      address: player.address || "",
      city: player.city || "",
    });
    setShowForm(true);
  };

  // ── Submit form ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await apiService.put(API_ENDPOINTS.PLAYER_BY_ID(editingId), formData);
        flash("Player updated successfully.");
      } else {
        await apiService.post(API_ENDPOINTS.PLAYERS, formData);
        flash("Player created successfully.");
      }
      setShowForm(false);
      setFormData(EMPTY_PLAYER);
      setEditingId(null);
      await fetchPlayers();
    } catch (err) {
      flashError(err.message || "Failed to save player.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiService.delete(
        API_ENDPOINTS.PLAYER_BY_ID(deleteTarget.id || deleteTarget._id),
      );
      flash(
        `Player "${deleteTarget.first_name} ${deleteTarget.last_name}" deleted.`,
      );
      setDeleteTarget(null);
      await fetchPlayers();
    } catch (err) {
      flashError(err.message || "Failed to delete player.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Field change helper ───────────────────────────────
  const onChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  // ── Special handler for age changes (auto-maps age_group) ──
  const handleAgeChange = (e) => {
    const age = e.target.value;
    const ageGroup = age ? getAgeGroup(Number(age)) : "";
    setFormData({ ...formData, age, age_group: ageGroup });
  };

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 max-md:px-4 max-md:py-6 max-md:pb-20">
        {/* Navigation Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-none">
          <button
            onClick={() => navigate("/coach-portal")}
            className="flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-200 whitespace-nowrap"
          >
            Overview
          </button>
          <button
            onClick={() => navigate("/manage-players")}
            className="flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm bg-red-600 text-white shadow-md transition-all duration-200 whitespace-nowrap"
          >
            Players
          </button>
          <button
            onClick={() =>
              navigate("/coach-portal", { state: { tab: "management-hub" } })
            }
            className="flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-200 whitespace-nowrap"
          >
            Management
          </button>
        </div>
        <PlayerTableSkeleton rows={10} showFilters={true} />
      </div>
    );
  }

  const isCoachPortal = location.pathname === "/coach-portal";

  return (
    <DashboardLayout title="Player Management">
      <PlayerManagementHeader
        playersCount={players.length}
        onAddPlayer={openCreate}
      />

      <ToastMessages successMsg={successMsg} error={error} />

      <PlayerFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
        ageGroups={AGE_GROUPS}
      />

      <PlayersTable
        players={players}
        filteredPlayers={paginatedPlayers}
        normalizeAgeGroup={normalizeAgeGroup}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        isSuperAdmin={isSuperAdmin}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={filtered.length}
        onPageChange={setCurrentPage}
      />

      <PlayerFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editingId={editingId}
        formData={formData}
        onChange={onChange}
        handleAgeChange={handleAgeChange}
        onSubmit={handleSubmit}
        formLoading={formLoading}
        ageGroups={AGE_GROUPS}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        title="Delete Player"
        displayName={deleteTarget ? [deleteTarget.first_name, deleteTarget.middle_name, deleteTarget.last_name].filter(Boolean).join(" ") : ""}
      />
    </DashboardLayout>
  );
};

export default PlayerManagement;
