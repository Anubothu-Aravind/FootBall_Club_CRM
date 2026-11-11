/**
 * AdminsTable Component
 * Displays list of admins with action buttons
 */
const AdminsTable = ({ admins, currentCoachId, onRoleChange, onPasswordReset, onDelete }) => {
  const isSelf = (admin) => admin.id === currentCoachId;

  if (admins.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">No admins found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Desktop table */}
      <div className="overflow-x-auto max-md:hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-5 py-3.5 font-semibold text-gray-600">Email</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Role</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600">Created</th>
              <th className="px-5 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id || admin._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-4 font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {admin.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[200px]">{admin.email}</span>
                    {isSelf(admin) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">You</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                    admin.role === "SUPER_ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  {!isSelf(admin) && (
                    <div className="flex items-center gap-2 justify-end">
                      {/* Promote / Demote */}
                      {admin.role === "ADMIN" ? (
                        <button
                          onClick={() => onRoleChange(admin, "promote")}
                          title="Promote to Super Admin"
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => onRoleChange(admin, "demote")}
                          title="Demote to Admin"
                          className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </button>
                      )}

                      {/* Reset Password */}
                      <button
                        onClick={() => onPasswordReset(admin)}
                        title="Reset password"
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(admin)}
                        title="Delete admin"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {admins.map((admin) => (
          <div key={admin.id || admin._id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0">
                {admin.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {admin.email}
                  {isSelf(admin) && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">You</span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    admin.role === "SUPER_ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(admin.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {!isSelf(admin) && (
              <div className="flex items-center gap-2 pl-12">
                {admin.role === "ADMIN" ? (
                  <button
                    onClick={() => onRoleChange(admin, "promote")}
                    className="flex-1 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer border-none"
                  >
                    Promote
                  </button>
                ) : (
                  <button
                    onClick={() => onRoleChange(admin, "demote")}
                    className="flex-1 py-2 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer border-none"
                  >
                    Demote
                  </button>
                )}
                <button
                  onClick={() => onPasswordReset(admin)}
                  className="flex-1 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border-none"
                >
                  Password
                </button>
                <button
                  onClick={() => onDelete(admin)}
                  className="flex-1 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border-none"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminsTable;
