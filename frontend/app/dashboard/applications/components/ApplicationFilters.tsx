'use client';

import { FaSearch, FaFilter } from 'react-icons/fa';

interface ApplicationFiltersProps {
  filters: {
    status: string;
    search: string;
  };
  onFilterChange: (filters: { status: string; search: string }) => void;
}

export default function ApplicationFilters({ filters, onFilterChange }: ApplicationFiltersProps) {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-brand-600">
          <FaFilter size={18} />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              <FaSearch size={16} />
            </div>
          </div>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            placeholder="Search by name, email, phone, or job title..."
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Filter by Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
