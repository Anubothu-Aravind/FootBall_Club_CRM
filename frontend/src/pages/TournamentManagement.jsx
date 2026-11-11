import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TournamentManagementHeader from "../components/tournament/TournamentManagementHeader";
import ToastMessages from "../components/common/ToastMessages";
import TournamentFilters from "../components/tournament/TournamentFilters";
import TournamentsTable from "../components/tournament/TournamentsTable";
import TournamentFormModal from "../components/tournament/TournamentFormModal";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import TournamentCardSkeleton from "../components/skeletons/TournamentCardSkeleton";

const EMPTY_TOURNAMENT = {
  name: "",
  age_group: "",
  status: "Upcoming",
  start_date: "",
  end_date: "",
  location: "",
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
  "Open",
];
const DEFAULT_STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

/**
 * TournamentManagement Page
 * Full CRUD for tournaments - any authenticated coach can create/edit,
 * only Super Admin can delete. Fetches dynamic categories from backend.
 */
const TournamentManagement = () => {
  const { coach } = useAuth();
  const isSuperAdmin = coach?.role === "SUPER_ADMIN";

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_TOURNAMENT);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Helpers ───────────────────────────────────────────
  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };
  const flashError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const toInputDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toISOString().split("T")[0];
  };

  const statusColor = (s) => {
    switch (s) {
      case "Upcoming":
        return "bg-blue-100 text-blue-700";
      case "Ongoing":
        return "bg-green-100 text-green-700";
      case "Completed":
        return "bg-gray-100 text-gray-600";
      case "Cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ── Fetch ─────────────────────────────────────────────
  const fetchTournaments = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.TOURNAMENTS);
      setTournaments(Array.isArray(data) ? data : data.tournaments || []);
    } catch (err) {
      flashError(err.message || "Failed to load tournaments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // ── Filtered list ─────────────────────────────────────
  const filtered = tournaments.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterGroup && t.age_group !== filterGroup) return false;
    if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  // ── Open form ─────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_TOURNAMENT);
    setShowForm(true);
  };
  const openEdit = (t) => {
    setEditingId(t.id || t._id);
    setFormData({
      name: t.name || "",
      age_group: t.age_group || "",
      status: t.status || "Upcoming",
      start_date: toInputDate(t.start_date),
      end_date: toInputDate(t.end_date),
      location: t.location || "",
    });
    setShowForm(true);
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await apiService.put(
          API_ENDPOINTS.TOURNAMENT_BY_ID(editingId),
          formData,
        );
        flash("Tournament updated successfully.");
      } else {
        await apiService.post(API_ENDPOINTS.TOURNAMENTS, formData);
        flash("Tournament created successfully.");
      }
      setShowForm(false);
      setFormData(EMPTY_TOURNAMENT);
      setEditingId(null);
      await fetchTournaments();
    } catch (err) {
      flashError(err.message || "Failed to save tournament.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiService.delete(
        API_ENDPOINTS.TOURNAMENT_BY_ID(deleteTarget.id || deleteTarget._id),
      );
      flash(`Tournament "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await fetchTournaments();
    } catch (err) {
      flashError(err.message || "Failed to delete tournament.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const onChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Tournament Management">
        <TournamentCardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tournament Management">
      <TournamentManagementHeader
        tournamentsCount={tournaments.length}
        onAddTournament={openCreate}
      />

      <ToastMessages successMsg={successMsg} error={error} />

      <TournamentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        statuses={statuses}
        ageGroups={AGE_GROUPS}
        onAddTournament={openCreate}
      />

      <TournamentsTable
        tournaments={tournaments}
        filteredTournaments={filtered}
        statusColor={statusColor}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        isSuperAdmin={isSuperAdmin}
      />

      <TournamentFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editingId={editingId}
        formData={formData}
        onChange={onChange}
        onSubmit={handleSubmit}
        formLoading={formLoading}
        ageGroups={AGE_GROUPS}
        statuses={statuses}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        title="Delete Tournament"
        displayName={deleteTarget?.name}
      />
    </DashboardLayout>
  );
};

export default TournamentManagement;
