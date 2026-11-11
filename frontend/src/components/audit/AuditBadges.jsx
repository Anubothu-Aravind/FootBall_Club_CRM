/**
 * Audit Badge Components
 * Reusable badge components for displaying audit log information
 */

/**
 * Severity Badge - displays severity level with appropriate color
 */
export const SeverityBadge = ({ severity }) => {
  const colors = {
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
    WARNING: "bg-orange-100 text-orange-800 border-orange-200",
    INFO: "bg-blue-100 text-blue-800 border-blue-200",
    DEBUG: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const icons = {
    CRITICAL: "!!",
    WARNING: "!",
    INFO: "i",
    DEBUG: "-",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[severity] || colors.INFO}`}
    >
      <span>{icons[severity]}</span>
      {severity}
    </span>
  );
};

/**
 * Category Badge - displays action category
 */
export const CategoryBadge = ({ category }) => {
  const colors = {
    AUTHENTICATION: "bg-purple-100 text-purple-800",
    SECURITY: "bg-red-100 text-red-800",
    DATA_MODIFICATION: "bg-green-100 text-green-800",
    ADMIN_MANAGEMENT: "bg-yellow-100 text-yellow-800",
    EMAIL_NOTIFICATION: "bg-cyan-100 text-cyan-800",
    SYSTEM: "bg-gray-100 text-gray-800",
  };

  const labels = {
    AUTHENTICATION: "Auth",
    SECURITY: "Security",
    DATA_MODIFICATION: "Data",
    ADMIN_MANAGEMENT: "Admin",
    EMAIL_NOTIFICATION: "Email",
    SYSTEM: "System",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[category] || colors.SYSTEM}`}
    >
      {labels[category] || category}
    </span>
  );
};

/**
 * Action Badge - displays action type with icon
 */
export const ActionBadge = ({ action }) => {
  const config = {
    CREATE: { color: "bg-green-100 text-green-800", icon: "+" },
    UPDATE: { color: "bg-blue-100 text-blue-800", icon: "Edit" },
    DELETE: { color: "bg-red-100 text-red-800", icon: "Del" },
    RESTORE: { color: "bg-purple-100 text-purple-800", icon: "Restore" },
    LOGIN_SUCCESS: { color: "bg-green-100 text-green-800", icon: "In" },
    LOGIN_FAILED: { color: "bg-red-100 text-red-800", icon: "X" },
    LOGOUT: { color: "bg-gray-100 text-gray-800", icon: "Out" },
    PASSWORD_CHANGE_SUCCESS: { color: "bg-yellow-100 text-yellow-800", icon: "Key" },
    PASSWORD_RESET_SUCCESS: { color: "bg-yellow-100 text-yellow-800", icon: "Key" },
    ADMIN_PROMOTE: { color: "bg-green-100 text-green-800", icon: "Up" },
    ADMIN_DEMOTE: { color: "bg-orange-100 text-orange-800", icon: "Dn" },
    ADMIN_PASSWORD_RESET: { color: "bg-yellow-100 text-yellow-800", icon: "Rst" },
  };

  const { color, icon } = config[action] || { color: "bg-gray-100 text-gray-800", icon: "Log" };

  // Format action name
  const formatAction = (a) => a.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      <span>{icon}</span>
      {formatAction(action)}
    </span>
  );
};

/**
 * Entity Type Badge
 */
export const EntityTypeBadge = ({ entityType }) => {
  const colors = {
    PLAYER: "bg-blue-100 text-blue-800",
    TOURNAMENT: "bg-green-100 text-green-800",
    ADMIN: "bg-purple-100 text-purple-800",
    SYSTEM: "bg-gray-100 text-gray-800",
  };

  const icons = {
    PLAYER: "P",
    TOURNAMENT: "T",
    ADMIN: "A",
    SYSTEM: "S",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[entityType] || colors.SYSTEM}`}>
      <span>{icons[entityType]}</span>
      {entityType}
    </span>
  );
};

/**
 * Actor Badge - displays user info
 */
export const ActorBadge = ({ email, role }) => {
  const roleColors = {
    SUPER_ADMIN: "bg-red-100 text-red-800 border-red-200",
    ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
    SYSTEM: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{email || "System"}</span>
      {role && (
        <span className={`text-xs px-1.5 py-0.5 rounded border ${roleColors[role] || roleColors.SYSTEM}`}>
          {role.replace("_", " ")}
        </span>
      )}
    </div>
  );
};

/**
 * Time Badge - displays formatted date/time
 */
export const TimeBadge = ({ timestamp }) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Format relative time
  const getRelativeTime = () => {
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <span className="text-xs text-gray-500" title={date.toLocaleString()}>
      {getRelativeTime()}
    </span>
  );
};

export default {
  SeverityBadge,
  CategoryBadge,
  ActionBadge,
  EntityTypeBadge,
  ActorBadge,
  TimeBadge,
};
