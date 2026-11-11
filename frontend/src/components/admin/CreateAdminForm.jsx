import { useState } from "react";

/**
 * CreateAdminForm Component
 * Form for creating new admin accounts
 */
const CreateAdminForm = ({ showForm, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "ADMIN" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: "", password: "", role: "ADMIN" });
  };

  const handleCancel = () => {
    setFormData({ email: "", password: "", role: "ADMIN" });
    onCancel();
  };

  if (!showForm) return null;

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Create New Admin</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@anantapurfc.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="text"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min 6 characters"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        <div className="sm:col-span-3 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Create Admin
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdminForm;
