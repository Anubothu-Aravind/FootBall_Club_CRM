import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ToastMessages from "../components/common/ToastMessages";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import ImageUploader from "../components/common/ImageUploader";

/**
 * AboutManagement Page (Super Admin)
 * Manage About page jersey content - CRUD with Cloudinary image uploads.
 * The featured jersey is shown as the main card on the public About page;
 * archive jerseys appear in the grid below it.
 */
const AboutManagement = () => {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    season: "",
    type: "Home",
    colorway: "",
    description: "",
    imageUrl: "",
    isFeatured: false,
    isActive: true,
  });

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3500); };
  const flashError = (msg) => { setError(msg); setTimeout(() => setError(""), 5000); };

  // Fetch all jerseys (admin endpoint includes inactive)
  const fetchJerseys = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.ABOUT_JERSEYS_ALL);
      setJerseys(data?.jerseys || []);
    } catch (err) {
      flashError(err.message || "Failed to load jerseys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJerseys(); }, [fetchJerseys]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ season: "", type: "Home", colorway: "", description: "", imageUrl: "", isFeatured: false, isActive: true });
    setShowForm(true);
  };

  const openEdit = (jersey) => {
    setEditingId(jersey.id || jersey._id);
    setFormData({
      season: jersey.season || "",
      type: jersey.type || "Home",
      colorway: jersey.colorway || "",
      description: jersey.description || "",
      imageUrl: jersey.imageUrl || "",
      isFeatured: jersey.isFeatured || false,
      isActive: jersey.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.season || !formData.colorway || !formData.imageUrl) {
      flashError("Season, colorway, and image are required");
      return;
    }
    setFormLoading(true);
    try {
      if (editingId) {
        await apiService.put(API_ENDPOINTS.ABOUT_JERSEY_BY_ID(editingId), formData);
        flash("Jersey updated successfully");
      } else {
        await apiService.post(API_ENDPOINTS.ABOUT_JERSEYS, formData);
        flash("Jersey added successfully");
      }
      setShowForm(false);
      fetchJerseys();
    } catch (err) {
      flashError(err.message || "Failed to save jersey");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.delete(API_ENDPOINTS.ABOUT_JERSEY_BY_ID(deleteTarget.id || deleteTarget._id));
      flash("Jersey deleted successfully");
      setDeleteTarget(null);
      fetchJerseys();
    } catch (err) {
      flashError(err.message || "Failed to delete jersey");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleFeatured = async (jersey) => {
    try {
      await apiService.put(API_ENDPOINTS.ABOUT_JERSEY_BY_ID(jersey.id || jersey._id), { isFeatured: !jersey.isFeatured });
      flash(jersey.isFeatured ? "Removed from featured" : "Set as featured jersey");
      fetchJerseys();
    } catch (err) {
      flashError(err.message || "Failed to update featured status");
    }
  };

  const featuredJersey = jerseys.find((j) => j.isFeatured);
  const archiveJerseys = jerseys.filter((j) => !j.isFeatured);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">About Page - Jerseys</h1>
            <p className="text-sm text-gray-500 mt-0.5">{jerseys.length} jersey{jerseys.length !== 1 ? "s" : ""} total</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-red-600 text-white font-semibold text-sm py-2.5 px-5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Jersey
          </button>
        </div>

        <ToastMessages error={error} success={successMsg} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jerseys.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No jerseys yet. Add your first jersey!</p>
          </div>
        ) : (
          <>
            {/* Featured Jersey */}
            {featuredJersey && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Featured Jersey</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex max-md:flex-col">
                    <div className="w-64 h-64 max-md:w-full max-md:h-48 bg-stone-100 shrink-0">
                      <img
                        src={featuredJersey.imageUrl}
                        alt={`${featuredJersey.season} Jersey`}
                        className="w-full h-full object-contain p-6"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-red-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded tracking-wide">
                          Featured
                        </span>
                        {!featuredJersey.isActive && (
                          <span className="inline-block bg-gray-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{featuredJersey.season}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {featuredJersey.type} • {featuredJersey.colorway}
                      </p>
                      {featuredJersey.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{featuredJersey.description}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => openEdit(featuredJersey)}
                          className="py-2 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(featuredJersey)}
                          className="py-2 px-4 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Archive Jerseys Grid */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Archive Jerseys ({archiveJerseys.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {archiveJerseys.map((jersey) => (
                  <div
                    key={jersey.id || jersey._id}
                    className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="aspect-square relative bg-stone-50">
                      <img
                        src={jersey.imageUrl}
                        alt={`${jersey.season} Jersey`}
                        className="w-full h-full object-contain p-4"
                        loading="lazy"
                      />
                      {!jersey.isActive && (
                        <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-0.5 rounded">
                          Hidden
                        </div>
                      )}
                      
                      {/* Desktop - Hover actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 hidden md:flex">
                        <button
                          onClick={() => openEdit(jersey)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border-none"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleFeatured(jersey)}
                          className="p-2 bg-white rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors cursor-pointer border-none"
                          title="Set as Featured"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(jersey)}
                          className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Mobile - Kebab menu */}
                      <div className="absolute top-2 right-2 md:hidden">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === jersey.id ? null : jersey.id)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors cursor-pointer border-none"
                          title="Actions"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        {openMenuId === jersey.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  openEdit(jersey);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer border-none bg-white"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Jersey
                              </button>
                              <button
                                onClick={() => {
                                  toggleFeatured(jersey);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-3 cursor-pointer border-none bg-white"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Set as Featured
                              </button>
                              <div className="h-px bg-gray-200 my-1" />
                              <button
                                onClick={() => {
                                  setDeleteTarget(jersey);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 cursor-pointer border-none bg-white"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Jersey
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900">{jersey.season}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{jersey.type} • {jersey.colorway}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Form Modal */}
        {showForm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                  {editingId ? "Edit Jersey" : "Add New Jersey"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image URL + Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Image *</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <div className="mt-2">
                      <ImageUploader
                        folder="jerseys"
                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                        className="w-full"
                        label="Upload Jersey Image"
                      />
                    </div>
                  </div>
                  {formData.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-48 bg-stone-50">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                    </div>
                  )}
                  {/* Season + Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
                      <input
                        type="text"
                        required
                        value={formData.season}
                        onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                        placeholder="e.g., 2025–26"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                      >
                        <option value="Home">Home</option>
                        <option value="Away">Away</option>
                        <option value="Third">Third</option>
                        <option value="HOME JERSEY">HOME JERSEY</option>
                        <option value="AWAY JERSEY">AWAY JERSEY</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                  </div>
                  {/* Colorway */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Colorway *</label>
                    <input
                      type="text"
                      required
                      value={formData.colorway}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorway: e.target.value }))}
                      placeholder="e.g., Red & White"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description for featured jersey..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </div>
                  {/* Toggles */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                      />
                      <label htmlFor="isFeatured" className="text-sm text-gray-700 cursor-pointer">Featured (main card)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Visible on site</label>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="py-2.5 px-5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center gap-2"
                    >
                      {formLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {editingId ? "Save Changes" : "Add Jersey"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        <DeleteConfirmModal
          target={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
          title="Delete Jersey"
          displayName={deleteTarget ? `${deleteTarget.season} ${deleteTarget.type}` : "this jersey"}
        />
      </div>
    </DashboardLayout>
  );
};

export default AboutManagement;
