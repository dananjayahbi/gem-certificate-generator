import { Search, X, Filter, Calendar, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchAndFiltersProps {
  onSearchChange: (search: string) => void;
  onRecipientFilterChange: (recipient: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function SearchAndFilters({
  onSearchChange,
  onRecipientFilterChange,
  onDateRangeChange,
}: SearchAndFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  // Debounce recipient filter
  useEffect(() => {
    const timer = setTimeout(() => {
      onRecipientFilterChange(recipientFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [recipientFilter, onRecipientFilterChange]);

  // Apply date range when both dates are set or cleared
  useEffect(() => {
    onDateRangeChange(startDate, endDate);
  }, [startDate, endDate, onDateRangeChange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setRecipientFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchTerm || recipientFilter || startDate || endDate;
  const activeFilterCount = [recipientFilter, startDate, endDate].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Search Bar Section */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by recipient name or issued to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2 transition-all duration-200"
            >
              <X size={20} />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showFilters && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Recipient Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User size={16} className="text-gray-400" />
                Filter by Recipient
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter recipient name..."
                  value={recipientFilter}
                  onChange={(e) => setRecipientFilter(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
                />
                {recipientFilter && (
                  <button
                    onClick={() => setRecipientFilter('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:bg-amber-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {recipientFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Recipient: {recipientFilter}
                    <button
                      onClick={() => setRecipientFilter('')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {startDate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    From: {new Date(startDate).toLocaleDateString()}
                    <button
                      onClick={() => setStartDate('')}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    To: {new Date(endDate).toLocaleDateString()}
                    <button
                      onClick={() => setEndDate('')}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
