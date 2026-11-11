import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * DashboardHeader Component
 * Top header bar for coach portal dashboard
 * Features: Page title, search, profile dropdown, logout, mobile menu button
 */
const DashboardHeader = ({
  title = "Dashboard",
  showSearch = false,
  onMenuClick = () => {},
}) => {
  const navigate = useNavigate();
  const { coach, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      {/* Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors border-none bg-transparent cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 m-0 truncate">
          {title}
        </h1>
      </div>

      {/* Search Bar (Optional) - Hidden on mobile */}
      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Right Section: Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 pr-2 sm:pr-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent min-h-[44px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm sm:text-base">
                {coach?.email?.charAt(0).toUpperCase() || "C"}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">
                {coach?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </div>
              <div className="text-xs text-gray-600 max-w-[150px] truncate">
                {coach?.email}
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 lg:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {coach?.email}
                </p>
                <span className="inline-block mt-1.5 sm:mt-2 bg-red-100 text-red-700 text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full">
                  {coach?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/change-password");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent text-left min-h-[44px]"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer border-none bg-transparent text-left font-semibold min-h-[44px]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
