/**
 * Header section for Training Management
 * Modern SaaS design with right-aligned primary action
 * Follows Fitts's Law and Visual Hierarchy principles
 */
const TrainingManagementHeader = ({ trainingsCount, onAddTraining }) => {
  return (
    <div className="bg-white border-b border-gray-100 -mx-6 px-6 pt-4 pb-4 max-md:-mx-5 max-md:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 max-md:text-lg">
            Training Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {trainingsCount} training session{trainingsCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Desktop: Right-aligned Add Button */}
        <button
          onClick={onAddTraining}
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm hover:shadow-md"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Training
        </button>
      </div>
    </div>
  );
};

export default TrainingManagementHeader;
