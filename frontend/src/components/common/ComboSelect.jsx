import { useState, useRef, useEffect } from "react";

/**
 * ComboSelect Component (Reusable)
 * A select dropdown that also allows typing custom values.
 * Shows predefined options + a text input for custom entry.
 *
 * Props:
 *   value - current value
 *   onChange(value) - called with selected or typed value
 *   options - array of strings or { value, label } objects
 *   placeholder - placeholder text
 *   required - HTML required
 *   disabled - HTML disabled
 *   className - wrapper class
 */
const ComboSelect = ({
  value = "",
  onChange,
  options = [],
  placeholder = "Select or type…",
  required = false,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize options to { value, label } format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // Check if current value is in predefined list
  const isValueInOptions = normalizedOptions.some((o) => o.value === value);

  // Filter options based on search
  const filtered = normalizedOptions.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
        setIsCustom(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
    setIsCustom(false);
  };

  const handleCustomSubmit = () => {
    if (search.trim()) {
      onChange(search.trim());
      setIsOpen(false);
      setSearch("");
      setIsCustom(false);
    }
  };

  const displayValue = value
    ? normalizedOptions.find((o) => o.value === value)?.label || value
    : "";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch("");
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
          disabled ? "bg-gray-50 cursor-not-allowed text-gray-500" : "bg-white cursor-pointer"
        }`}
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        {!isValueInOptions && value && (
          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-1 shrink-0">
            custom
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search / Custom input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length === 1) {
                    selectOption(filtered[0].value);
                  } else if (search.trim() && filtered.length === 0) {
                    handleCustomSubmit();
                  }
                }
                if (e.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                }
              }}
              placeholder="Search or type custom…"
              className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-44">
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectOption(opt.value)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer border-none ${
                  opt.value === value
                    ? "bg-red-50 text-red-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}

            {/* No results - show custom entry */}
            {filtered.length === 0 && search.trim() && (
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="w-full px-3 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-none flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add "{search.trim()}" as custom
              </button>
            )}

            {/* Always show "type custom" link at bottom */}
            {filtered.length > 0 && !isCustom && (
              <button
                type="button"
                onClick={() => {
                  setIsCustom(true);
                  inputRef.current?.focus();
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-400 hover:text-blue-600 hover:bg-gray-50 cursor-pointer border-none border-t border-gray-100"
              >
                Or type a custom value…
              </button>
            )}

            {/* Custom value submit when in custom mode */}
            {isCustom && search.trim() && (
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="w-full px-3 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-none flex items-center gap-2 border-t border-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Use "{search.trim()}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboSelect;
