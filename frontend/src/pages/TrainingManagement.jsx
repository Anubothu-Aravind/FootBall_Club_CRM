import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TrainingManagementHeader from "../components/training/TrainingManagementHeader";
import ToastMessages from "../components/common/ToastMessages";
import TrainingFilters from "../components/training/TrainingFilters";
import TrainingsTable from "../components/training/TrainingsTable";
import TrainingFormModal from "../components/training/TrainingFormModal";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import TrainingCardSkeleton from "../components/skeletons/TrainingCardSkeleton";

const EMPTY_TRAINING = {
  title: "",
  age_group: "",
  type: "Technical",
  status: "Scheduled",
  session_date: "",
  duration: 60,
  location: "",
  coach_name: "",
  participants_count: 0,
  description: "",
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
const DEFAULT_STATUSES = ["Scheduled", "Ongoing", "Completed", "Cancelled"];
const DEFAULT_TYPES = [
  "Technical",
  "Tactical",
  "Physical",
  "Mental",
  "Goalkeeper",
  "Team Building",
];

/**
 * TrainingManagement Page
 * Full CRUD for training sessions - any authenticated coach can create/edit,
 * only Super Admin can delete. Fetches dynamic categories from backend.
 */
const TrainingManagement = () => {
  const { coach } = useAuth();
  const isSuperAdmin = coach?.role === "SUPER_ADMIN";

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_TRAINING);
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
      case "Scheduled":
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

  const typeColor = (t) => {
    switch (t) {
      case "Technical":
        return "bg-purple-100 text-purple-700";
      case "Tactical":
        return "bg-blue-100 text-blue-700";
      case "Physical":
        return "bg-red-100 text-red-700";
      case "Mental":
        return "bg-indigo-100 text-indigo-700";
      case "Goalkeeper":
        return "bg-yellow-100 text-yellow-700";
      case "Team Building":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ── Fetch ─────────────────────────────────────────────
  const fetchTrainings = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.TRAININGS);
      setTrainings(Array.isArray(data) ? data : data.trainings || []);
    } catch (err) {
      flashError(err.message || "Failed to load training sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  // ── Filtered list ─────────────────────────────────────
  const filtered = trainings.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterGroup && t.age_group !== filterGroup) return false;
    if (filterType && t.type !== filterType) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  // ── Open form ─────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_TRAINING);
    setShowForm(true);
  };
  const openEdit = (t) => {
    setEditingId(t.id || t._id);
    setFormData({
      title: t.title || "",
      age_group: t.age_group || "",
      type: t.type || "Technical",
      status: t.status || "Scheduled",
      session_date: toInputDate(t.session_date),
      duration: t.duration || 60,
      location: t.location || "",
      coach_name: t.coach_name || "",
      participants_count: t.participants_count || 0,
      description: t.description || "",
    });
    setShowForm(true);
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await apiService.put(API_ENDPOINTS.TRAINING_BY_ID(editingId), formData);
        flash("Training session updated successfully.");
      } else {
        await apiService.post(API_ENDPOINTS.TRAININGS, formData);
        flash("Training session created successfully.");
      }
      setShowForm(false);
      setFormData(EMPTY_TRAINING);
      setEditingId(null);
      await fetchTrainings();
    } catch (err) {
      flashError(err.message || "Failed to save training session.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiService.delete(
        API_ENDPOINTS.TRAINING_BY_ID(deleteTarget.id || deleteTarget._id),
      );
      flash(`Training session "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await fetchTrainings();
    } catch (err) {
      flashError(err.message || "Failed to delete training session.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const onChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Training Management">
        <TrainingCardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Training Management">
      <TrainingManagementHeader
        trainingsCount={trainings.length}
        onAddTraining={openCreate}
      />

      <ToastMessages successMsg={successMsg} error={error} />

      <TrainingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        filterType={filterType}
        setFilterType={setFilterType}
        statuses={statuses}
        ageGroups={AGE_GROUPS}
        types={types}
        onAddTraining={openCreate}
      />

      <TrainingsTable
        trainings={trainings}
        filteredTrainings={filtered}
        statusColor={statusColor}
        typeColor={typeColor}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        isSuperAdmin={isSuperAdmin}
      />

      <TrainingFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editingId={editingId}
        formData={formData}
        onChange={onChange}
        onSubmit={handleSubmit}
        formLoading={formLoading}
        ageGroups={AGE_GROUPS}
        statuses={statuses}
        types={types}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        title="Delete Training Session"
        displayName={deleteTarget?.title}
      />
    </DashboardLayout>
  );
};

export default TrainingManagement;
