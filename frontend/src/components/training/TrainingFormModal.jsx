import ComboSelect from "../common/ComboSelect";

/**
 * Create/Edit Training Form Modal
 */
const TrainingFormModal = ({ 
  showForm, 
  setShowForm, 
  editingId, 
  formData, 
  onChange,
  onSubmit, 
  formLoading,
  ageGroups,
  statuses,
  types 
}) => {
  if (!showForm) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowForm(false)} />
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            {editingId ? "Edit Training Session" : "Add New Training Session"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={onChange("title")} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                placeholder="e.g., Ball Control & Dribbling Skills"
              />
            </div>
            {/* Row: Type, Age Group, Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <ComboSelect
                  value={formData.type}
                  onChange={(val) => onChange("type")({ target: { value: val } })}
                  options={types}
                  placeholder="Select or type…"
                  required
                />
              </div>
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
            {/* Row: Session Date, Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Date *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.session_date} 
                  onChange={onChange("session_date")} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                <input 
                  type="number" 
                  required 
                  min="15"
                  step="15"
                  value={formData.duration} 
                  onChange={onChange("duration")} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  placeholder="60"
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
                placeholder="e.g., Main Training Ground"
              />
            </div>
            {/* Row: Coach Name, Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coach Name</label>
                <input 
                  type="text" 
                  value={formData.coach_name} 
                  onChange={onChange("coach_name")} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  placeholder="e.g., Coach John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.participants_count} 
                  onChange={onChange("participants_count")} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  placeholder="20"
                />
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={formData.description} 
                onChange={onChange("description")} 
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                placeholder="Brief description of training session objectives and activities..."
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
                {editingId ? "Save Changes" : "Add Training Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TrainingFormModal;
