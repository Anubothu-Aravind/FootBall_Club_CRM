import { Link } from "react-router-dom";

/**
 * QuickActions Component
 * Clean management tools grid optimized for users aged 45-50
 * Large text, clear labels, spacious clickable areas
 */
const QuickActions = ({ quickLinks }) => {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 lg:mb-6">
        Management Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-900 active:shadow-lg transition-all no-underline block min-h-[110px] sm:min-h-[120px]"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-900 text-white rounded-xl flex items-center justify-center group-hover:bg-blue-800 transition-colors shrink-0">
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg lg:text-base font-bold text-gray-900 group-hover:text-blue-900 transition-colors truncate">
                  {link.title}
                </h3>
              </div>
            </div>
            <p className="text-sm sm:text-base lg:text-sm text-gray-700 leading-relaxed line-clamp-2">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
