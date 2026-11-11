import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * GlobalFooter Component
 * Mobile: Clean 2-column grid layout + sticky contact bar
 * Desktop: Traditional 4-column grid
 * Optimized per Jakob's, Hick's, Fitts's, Miller's Laws + WCAG 2.2 AA
 */
const GlobalFooter = () => {
  const { user } = useAuth();

  const footerSections = [
    {
      id: "quick-links",
      title: "Quick Links",
      links: [
        { to: "/", label: "Home" },
        { to: "/about", label: "About Us" },
        { to: "/gallery", label: "Gallery" },
        { to: "/contact", label: "Contact Us" },
      ],
    },
    // {
    //   id: "resources",
    //   title: "Resources",
    //   links: [
    //     { to: "/manage-tournaments", label: "Tournaments" },
    //     // {
    //     //   to: user?.role === "player" ? "/player-dashboard" : "/login",
    //     //   label: "Player Portal",
    //     // },
    //     {
    //       to: user?.role === "coach" ? "/coach-portal" : "/login",
    //       label: "Coach Portal",
    //     },
    //     // {
    //     //   to: user?.role === "admin" ? "/admin-dashboard" : "/login",
    //     //   label: "Admin Portal",
    //     // },
    //   ],
    // },
    {
      id: "legal",
      title: "Legal",
      links: [
        { to: "/privacy-policy", label: "Data Protection" },
        { to: "/terms", label: "User Agreement" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Sticky Contact Bar - Always visible above ScrollToTop button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-linear-to-r from-orange-600 to-red-600 shadow-2xl md:hidden">
        <div className="flex items-stretch h-15">
          {/* Call Button - Fitts's Law: 44px+ tap target */}
          <a
            href="tel:+919876543210"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-white no-underline transition-all duration-200 active:bg-white/20 min-h-11 border-r border-white/20"
            aria-label="Call us"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-[10px] font-medium">Call</span>
          </a>

          {/* Email Button */}
          <a
            href="mailto:contact@anantapurfc.com"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-white no-underline transition-all duration-200 active:bg-white/20 min-h-11 border-r border-white/20"
            aria-label="Email us"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] font-medium">Email</span>
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-white no-underline transition-all duration-200 active:bg-white/20 min-h-11"
            aria-label="WhatsApp us"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="w-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-15 md:pb-0">
        {/* Mobile: Grid Layout (Matches Reference Design) */}
        <div className="md:hidden px-5 py-8">
          {/* Brand Section */}
          <div className="mb-8 pb-6 border-b border-gray-700">
            <Link to="/" className="inline-block mb-3">
              <h2 className="text-2xl font-bold m-0 bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Anantapur FC
              </h2>
            </Link>
            <p className="text-sm text-gray-400 m-0 leading-relaxed">
              Building Champions Since 2016
            </p>
          </div>

          {/* Navigation Sections - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 mb-8">
            {footerSections.map((section) => (
              <div key={section.id}>
                <h3 className="text-sm font-bold mb-3 text-white uppercase tracking-wider m-0">
                  {section.title}
                </h3>
                <ul className="list-none m-0 p-0 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-gray-400 no-underline transition-colors duration-200 hover:text-orange-500 text-[13px] leading-relaxed"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Media - Mobile */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wider m-0">
              Follow Us
            </h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 text-white no-underline transition-all duration-200 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 text-white no-underline transition-all duration-200 hover:bg-linear-to-r hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 text-white no-underline transition-all duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Twitter"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Desktop: 3-Column Grid (Jakob's Law - Familiar Pattern) */}
        <div className="hidden md:block px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Brand + Grid */}
            <div className="grid grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div>
                <Link to="/" className="inline-block mb-4">
                  <h2 className="text-2xl font-bold m-0 bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Anantapur FC
                  </h2>
                </Link>
                <p className="text-gray-400 text-sm m-0 mb-6">
                  Building Champions Since 2016
                </p>

                {/* Social Media - Desktop */}
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white no-underline transition-all duration-200 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Facebook"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white no-underline transition-all duration-200 hover:bg-linear-to-r hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Instagram"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white no-underline transition-all duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Twitter"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Navigation Columns */}
              {footerSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-base font-semibold mb-4 text-white m-0">
                    {section.title}
                  </h3>
                  <ul className="list-none m-0 p-0 space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="text-gray-400 no-underline transition-colors duration-200 hover:text-orange-500 text-sm"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Desktop Legal Footer */}
            <div className="pt-8 border-t border-gray-700">
              <div className="flex justify-between items-center gap-6">
                <p className="text-gray-400 text-sm m-0">
                  © {new Date().getFullYear()} Anantapur Football Club. All
                  rights reserved.
                </p>
                <div className="flex gap-6">
                  <Link
                    to="/privacy-policy"
                    className="text-gray-400 no-underline transition-colors duration-200 hover:text-orange-500 text-sm"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="text-gray-400 no-underline transition-colors duration-200 hover:text-orange-500 text-sm"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Legal Footer */}
        <div className="md:hidden px-5 py-6 bg-black/30 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center m-0 mb-4 leading-relaxed">
            © {new Date().getFullYear()} Anantapur Football Club. All rights
            reserved.
          </p>
          <div className="flex justify-center items-center gap-5 flex-wrap">
            <Link
              to="/privacy-policy"
              className="text-gray-400 no-underline transition-colors duration-200 hover:text-orange-500 text-xs font-medium"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              to="/terms"
              className="text-gray-400 no-underline transition-colors duration-200 hover:text-orange-500 text-xs font-medium"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default GlobalFooter;
