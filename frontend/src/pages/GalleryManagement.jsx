import { useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ToastMessages from "../components/common/ToastMessages";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import ImageUploader from "../components/common/ImageUploader";

/**
 * GalleryManagement Page (Super Admin)
 * Full CRUD for gallery images with Cloudinary upload and ordering
 */
const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    altText: "",
    imageUrl: "",
    category: "",
    tags: "",
    isActive: true,
  });

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3500); };
  const flashError = (msg) => { setError(msg); setTimeout(() => setError(""), 5000); };

  // Fetch gallery images
  const fetchImages = useCallback(async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.GALLERY, { limit: 100, includeInactive: true });
      setImages(data?.images || data?.gallery || (Array.isArray(data) ? data : []));
    } catch (err) {
      flashError(err.message || "Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ title: "", caption: "", altText: "", imageUrl: "", category: "", tags: "", isActive: true });
    setShowForm(true);
  };

  const openEdit = (img) => {
    setEditingId(img.id || img._id);
    setFormData({
      title: img.title || "",
      caption: img.caption || "",
      altText: img.altText || "",
      imageUrl: img.imageUrl || img.url || "",
      category: img.category || "",
      tags: Array.isArray(img.tags) ? img.tags.join(", ") : (img.tags || ""),
      isActive: img.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      };

      if (editingId) {
        await apiService.put(API_ENDPOINTS.GALLERY_BY_ID(editingId), payload);
        flash("Image updated successfully");
      } else {
        await apiService.post(API_ENDPOINTS.GALLERY, payload);
        flash("Image added successfully");
      }
      setShowForm(false);
      fetchImages();
    } catch (err) {
      flashError(err.message || "Failed to save image");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.delete(API_ENDPOINTS.GALLERY_BY_ID(deleteTarget.id || deleteTarget._id));
      flash("Image deleted successfully");
      setDeleteTarget(null);
      fetchImages();
    } catch (err) {
      flashError(err.message || "Failed to delete image");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">Gallery Management</h1>
            <p className="text-gray-500 text-sm mt-1">{images.length} images</p>
          </div>
          <button
            onClick={openCreate}
            className="py-2.5 px-5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </button>
        </div>

        <ToastMessages error={error} successMsg={successMsg} />

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No gallery images yet. Add your first image!</p>
          </div>
        ) : (
          /* Image Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img._id || img.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={img.imageUrl || img.url}
                    alt={img.altText || img.title || "Gallery image"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {!img.isActive && (
                    <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-0.5 rounded">
                      Hidden
                    </div>
                  )}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(img)}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(img)}
                      className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{img.title || img.caption || "Untitled"}</p>
                  {img.category && (
                    <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{img.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                  {editingId ? "Edit Image" : "Add New Image"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <div className="mt-2">
                      <ImageUploader
                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  {formData.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-40">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Match Day"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <input
                      type="text"
                      value={formData.caption}
                      onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="football, match, training"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Visible in gallery</label>
                  </div>
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
                      {editingId ? "Save Changes" : "Add Image"}
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
          title="Delete Gallery Image"
          displayName={deleteTarget?.title || "this image"}
        />
      </div>
    </DashboardLayout>
  );
};

export default GalleryManagement;
