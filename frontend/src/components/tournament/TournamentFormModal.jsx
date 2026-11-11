import ComboSelect from "../common/ComboSelect";

/**
 * Create/Edit Tournament Form Modal
 */
const TournamentFormModal = ({ 
  showForm, 
  setShowForm, 
  editingId, 
  formData, 
  onChange,
  onSubmit, 
  formLoading,
  ageGroups,
  statuses 
}) => {
  if (!showForm) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowForm(false)} />
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            {editingId ? "Edit Tournament" : "Add New Tournament"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name *</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={onChange("name")} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
            {/* Row: Age Group, Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group *</label>
                <ComboSelect
                  value={formData.age_group}
                  onChange={(val) => onChange("age_group")({ target: { value: val } })}
                  options={ageGroups}
                  placeholder="Select…"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <ComboSelect
                  value={formData.status}
                  onChange={(val) => onChange("status")({ target: { value: val } })}
                  options={statuses}
                  placeholder="Select…"
                />
              </div>
            </div>
            {/* Row: Start Date, End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.start_date} 
                  onChange={onChange("start_date")} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.end_date} 
                  onChange={onChange("end_date")} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
            </div>
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input 
                type="text" 
                required 
                value={formData.location} 
                onChange={onChange("location")} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
            {/* Buttons */}
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
                {editingId ? "Save Changes" : "Add Tournament"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TournamentFormModal;
