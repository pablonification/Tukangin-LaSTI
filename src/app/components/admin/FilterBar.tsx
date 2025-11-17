import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: {
    [key: string]: {
      label: string;
      options: FilterOption[];
      value: string;
      onChange: (value: string) => void;
    };
  };
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const FilterBar = ({
  filters,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange
}: FilterBarProps) => {
  return (
    <div className="bg-white rounded-2xl border border-[#D4D4D4] p-4 md:p-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-end lg:space-y-0 lg:space-x-4">
        {/* Search */}
        {onSearchChange && (
          <div className="flex-1 min-w-0">
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 lg:space-x-4">
          {Object.entries(filters).map(([key, filter]) => (
            <div key={key} className="min-w-0 flex-1 sm:min-w-[180px] sm:flex-initial lg:min-w-[200px]">
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
