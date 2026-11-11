/**
 * DeleteConfirmModal Component
 * Generic confirmation modal for delete operations.
 * Used across Admin, Player, Tournament, and Training management pages.
 *
 * @param {object}   target      - The entity to delete (modal hidden when null/undefined)
 * @param {function} onConfirm   - Called when the user confirms deletion
 * @param {function} onCancel    - Called when the user cancels (backdrop click or Cancel button)
 * @param {boolean}  loading     - Disables the Delete button and shows a spinner
 * @param {string}   title       - Modal heading, e.g. "Delete Player"
 * @param {string}   displayName - Human-readable name shown in the confirmation text
 */
const DeleteConfirmModal = ({ target, onConfirm, onCancel, loading, title = "Delete Item", displayName = "" }) => {
  if (!target) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">{title}</h2>
          <p className="text-sm text-gray-500 text-center mb-5">
            Are you sure you want to delete <span className="font-medium text-gray-700">{displayName}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
