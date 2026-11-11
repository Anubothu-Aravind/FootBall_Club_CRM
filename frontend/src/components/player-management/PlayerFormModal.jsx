import ComboSelect from "../common/ComboSelect";

/**
 * Create/Edit Player Form Modal
 * Supports age_group_auto toggle - when ON, age group auto-calculates from age
 */
const PlayerFormModal = ({
  showForm,
  setShowForm,
  editingId,
  formData,
  onChange,
  handleAgeChange,
  onSubmit,
  formLoading,
  ageGroups,
}) => {
  if (!showForm) return null;

  const isAutoAgeGroup = formData.age_group_auto !== false;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={() => setShowForm(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            {editingId ? "Edit Player" : "Add New Player"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={onChange("first_name")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={onChange("last_name")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={onChange("middle_name")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {/* Row: Age, Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.age}
                  onChange={handleAgeChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <ComboSelect
                  value={formData.gender}
                  onChange={(val) => onChange("gender")({ target: { value: val } })}
                  options={["Male", "Female"]}
                  placeholder="Select or type…"
                  required
                />
              </div>
            </div>
            {/* Row: Age Group with auto toggle, Jersey */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Age Group *
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-xs text-gray-500">Auto</span>
                    <input
                      type="checkbox"
                      checked={isAutoAgeGroup}
                      onChange={(e) => onChange("age_group_auto")({ target: { value: e.target.checked } })}
                      className="w-3.5 h-3.5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                    />
                  </label>
                </div>
                <ComboSelect
                  value={formData.age_group}
                  onChange={(val) => onChange("age_group")({ target: { value: val } })}
                  options={ageGroups}
                  placeholder="Select…"
                  required
                  disabled={isAutoAgeGroup}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey # *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.jersey_no}
                  onChange={onChange("jersey_no")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Row: Size, Height, Weight */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size *
                </label>
                <input
                  type="text"
                  required
                  value={formData.size}
                  onChange={onChange("size")}
                  placeholder="e.g. M"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.height}
                  onChange={onChange("height")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.weight}
                  onChange={onChange("weight")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Row: Address, City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={onChange("address")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={onChange("city")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
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
                {formLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {editingId ? "Save Changes" : "Add Player"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PlayerFormModal;
