import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * NavBar Component
 * Responsive navigation bar with logo, menu items, and active state management
 * Features smooth transitions, hover effects, and mobile menu with React Router
 * Shows /players & /coach-portal only when a coach is logged in.
 */
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, coach, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Public nav items - always visible
  const publicItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact Us", path: "/contact" },
  ];

  // Coach-only items - visible only when authenticated
  const coachItems = [
    { name: "Players", path: "/players" },
    { name: "Coach Portal", path: "/coach-portal" },
  ];

  const navItems = isAuthenticated
    ? [...publicItems, ...coachItems]
    : publicItems;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="w-full bg-white py-2 px-16 max-lg:px-8 max-md:px-5 max-[480px]:px-4 border-b border-gray-200 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-3 no-underline text-inherit max-[480px]:gap-2"
          >
            <img
              src="https://res.cloudinary.com/doakquevf/image/upload/v1770738108/ACFC_Logo_kzvyes.png"
              alt="Anantapur FC Logo"
              className="w-12 h-12 rounded-full object-cover max-lg:w-11 max-lg:h-11 max-md:w-10 max-md:h-10 max-[480px]:w-10 max-[480px]:h-10"
            />
            <div>
              <h1 className="text-base font-semibold text-gray-900 m-0 max-md:text-sm max-[480px]:text-[13px]">
                Anantapur FC
              </h1>
              <p className="text-xs text-red-600 font-medium m-0 max-md:text-[10px] max-[480px]:text-[9px]">
                EST. 2020
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="flex items-center gap-2 max-md:hidden">
            <ul className="flex items-center gap-2 list-none m-0 p-0">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`py-2.5 px-5 rounded-full font-medium text-sm border-none cursor-pointer transition-all duration-200 no-underline max-lg:py-2 max-lg:px-4 max-lg:text-[13px] ${
                      isActive(item.path)
                        ? "bg-red-600 text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Login button or Profile dropdown */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className={`ml-2 py-2.5 px-6 rounded-full font-semibold text-sm no-underline transition-all duration-200 max-lg:py-2 max-lg:px-5 max-lg:text-[13px] ${
                  isActive("/login")
                    ? "bg-red-600 text-white"
                    : "border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                }`}
              >
                Login
              </Link>
            ) : (
              <div className="relative ml-2" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 py-2 px-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                    {coach?.email?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
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

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {coach?.email}
                      </p>
                      <span className="inline-block mt-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {coach?.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : "Admin"}
                      </span>
                    </div>
                    <Link
                      to="/change-password"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2 no-underline"
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
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      Change Password
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
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
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="hidden max-md:flex items-center justify-center bg-none border-none text-gray-700 cursor-pointer p-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
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
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer - Professional Sports Academy Style */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white z-[101] rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out overflow-hidden ${
          isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            className="w-10 h-10 flex items-center justify-center bg-gray-100 border-none cursor-pointer rounded-full text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto pb-6"
          style={{ maxHeight: "calc(90vh - 40px)" }}
        >
          {/* Profile Section - Only for authenticated users */}
          {isAuthenticated && (
            <div className="px-6 pt-2 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {coach?.email?.charAt(0).toUpperCase() || "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate m-0">
                    {coach?.email}
                  </p>
                  <span className="inline-block mt-1 bg-red-50 text-red-600 text-xs font-medium px-2 py-0.5 rounded-md">
                    {coach?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation Section */}
          <div className="px-4 py-4">
            <div className="divide-y divide-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center justify-between w-full py-4 px-4 text-left no-underline transition-colors relative ${
                    isActive(item.path)
                      ? "text-red-600 font-medium bg-red-50/50"
                      : "text-gray-700 font-normal hover:bg-gray-50 active:bg-gray-100"
                  }`}
                  style={{ minHeight: "56px" }}
                >
                  <span className="text-[15px]">{item.name}</span>
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
                  )}
                  <svg
                    className={`w-5 h-5 ${isActive(item.path) ? "text-red-600" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Account Section - Separated with spacing */}
          <div className="px-4 pt-3 pb-4">
            <div className="h-px bg-gray-200 mb-4" />

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="flex items-center justify-center w-full py-3.5 rounded-xl font-semibold text-[15px] no-underline transition-all bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm"
                style={{ minHeight: "56px" }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login
              </Link>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/change-password"
                  onClick={handleNavClick}
                  className="flex items-center w-full py-4 px-4 text-left no-underline transition-colors text-gray-700 font-normal hover:bg-gray-50 active:bg-gray-100 rounded-lg"
                  style={{ minHeight: "56px" }}
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500"
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
                  <span className="text-[15px]">Change Password</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full py-4 px-4 text-left transition-colors text-red-600 font-medium hover:bg-red-50 active:bg-red-100 rounded-lg cursor-pointer border-none bg-transparent"
                  style={{ minHeight: "56px" }}
                >
                  <svg
                    className="w-5 h-5 mr-3"
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
                  <span className="text-[15px]">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
