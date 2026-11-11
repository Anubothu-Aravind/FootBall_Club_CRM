import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminManagementHeader from "../components/admin/AdminManagementHeader";
import ToastMessages from "../components/common/ToastMessages";
import CreateAdminForm from "../components/admin/CreateAdminForm";
import AdminsTable from "../components/admin/AdminsTable";
import PasswordResetModal from "../components/admin/PasswordResetModal";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";

/**
 * AdminManagement Page
 * Super-Admin-only dashboard for managing all admin/coach accounts.
 * Features: list, create, promote/demote, reset password, delete.
 */
const AdminManagement = () => {
  const { coach } = useAuth();

  // ── State ─────────────────────────────────────────────
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Password modal
  const [passwordModal, setPasswordModal] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  // ── Fetch admins ──────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.ADMINS);
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      flashError(err.message || "Failed to load admins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // ── Create admin ──────────────────────────────────────
  const handleCreate = async (formData) => {
    if (!formData.email.trim() || !formData.password.trim()) {
      flashError("Email and password are required.");
      return;
    }
    if (formData.password.length < 6) {
      flashError("Password must be at least 6 characters.");
      return;
    }
    setCreateLoading(true);
    try {
      await apiService.post(API_ENDPOINTS.ADMINS, formData);
      flash("Admin created successfully.");
      setShowCreateForm(false);
      await fetchAdmins();
    } catch (err) {
      flashError(err.message || "Failed to create admin.");
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Promote / Demote ──────────────────────────────────
  const handleRoleChange = async (admin, action) => {
    try {
      const endpoint =
        action === "promote"
          ? API_ENDPOINTS.ADMIN_PROMOTE(admin.id)
          : API_ENDPOINTS.ADMIN_DEMOTE(admin.id);
      await apiService.put(endpoint);
      flash(`Admin ${action}d successfully.`);
      await fetchAdmins();
    } catch (err) {
      flashError(err.message || `Failed to ${action} admin.`);
    }
  };

  // ── Password reset ────────────────────────────────────
  const handlePasswordReset = async (newPassword) => {
    if (!newPassword.trim()) {
      flashError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      flashError("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      await apiService.put(API_ENDPOINTS.ADMIN_PASSWORD(passwordModal.id), {
        password: newPassword,
      });
      flash(`Password updated for ${passwordModal.email}.`);
      setPasswordModal(null);
    } catch (err) {
      flashError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete admin ──────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiService.delete(API_ENDPOINTS.ADMIN_BY_ID(deleteConfirm.id));
      flash(`Admin ${deleteConfirm.email} deleted.`);
      setDeleteConfirm(null);
      await fetchAdmins();
    } catch (err) {
      flashError(err.message || "Failed to delete admin.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Admin Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Management">
      <AdminManagementHeader
        adminCount={admins.length}
        onCreateClick={() => setShowCreateForm(!showCreateForm)}
      />

      <ToastMessages successMsg={successMsg} error={error} />

      <CreateAdminForm
        showForm={showCreateForm}
        onSubmit={handleCreate}
        onCancel={() => setShowCreateForm(false)}
        loading={createLoading}
      />

      <AdminsTable
        admins={admins}
        currentCoachId={coach?.id}
        onRoleChange={handleRoleChange}
        onPasswordReset={(admin) => setPasswordModal(admin)}
        onDelete={(admin) => setDeleteConfirm(admin)}
      />

      <PasswordResetModal
        admin={passwordModal}
        onSubmit={handlePasswordReset}
        onCancel={() => setPasswordModal(null)}
        loading={passwordLoading}
      />

      <DeleteConfirmModal
        target={deleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        title="Delete Admin"
        displayName={deleteConfirm?.email}
      />
    </DashboardLayout>
  );
};

export default AdminManagement;
