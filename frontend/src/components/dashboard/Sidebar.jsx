import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar Component
 * Fixed left navigation for coach portal dashboard
 * Features: Logo, navigation items with icons, active state, role-based menu, mobile responsive
 */
const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { coach } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

  // Main navigation items
  const mainNavItems = [
    {
      name: "Dashboard",
      path: "/coach-portal",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Players",
      path: "/manage-players",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      name: "Tournaments",
      path: "/manage-tournaments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Training",
      path: "/manage-trainings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      name: "Jersey Likes",
      path: "/jersey-likes",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  // Admin-only navigation items
  const adminNavItems =
    coach?.role === "SUPER_ADMIN"
      ? [
          {
            name: "Staff",
            path: "/admin-management",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
          },
          {
            name: "Audit Logs",
            path: "/audit-logs",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
          {
            name: "Deleted Records",
            path: "/deleted-records",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ),
          },
          {
            name: "Export Center",
            path: "/export-center",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            ),
          },
          {
            name: "Gallery Mgmt",
            path: "/manage-gallery",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            name: "Contact Info",
            path: "/manage-contact-info",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            ),
          },
          {
            name: "About Page",
            path: "/manage-about",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
        ]
      : [];

  const allNavItems = [...mainNavItems, ...adminNavItems];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 lg:w-60 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Logo Section */}
      <div className="p-5 lg:p-6 border-b border-gray-200">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
        >
          <img
            src="https://res.cloudinary.com/doakquevf/image/upload/v1770738108/ACFC_Logo_kzvyes.png"
            alt="Anantapur FC Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h1 className="text-base font-bold text-gray-900 m-0">
              Anantapur FC
            </h1>
            <p className="text-xs text-red-600 font-semibold m-0">
              Coach Portal
            </p>
          </div>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <ul className="flex flex-col gap-1 list-none m-0 p-0">
          {allNavItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border-none cursor-pointer min-h-[44px] ${
                  isActive(item.path)
                    ? "bg-red-50 text-red-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 font-medium active:bg-gray-100"
                }`}
              >
                <div className="w-5 h-5">
                  {item.icon}
                </div>
                <span className="text-base">
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p className="m-0">Pocket Soccer Scout</p>
          <p className="m-0 mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
