import { useState } from "react";

/**
 * PasswordResetModal Component
 * Modal for resetting admin passwords
 */
const PasswordResetModal = ({ admin, onSubmit, onCancel, loading }) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!admin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newPassword);
    setNewPassword("");
    setShowPassword(false);
  };

  const handleCancel = () => {
    setNewPassword("");
    setShowPassword(false);
    onCancel();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={handleCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-5">
            Set a new password for <span className="font-medium text-gray-700">{admin.email}</span>
          </p>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex gap-3 justify-end">
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
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordResetModal;
