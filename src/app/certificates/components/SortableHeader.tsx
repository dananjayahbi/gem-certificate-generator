import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export default function SortableHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSortBy === sortKey;

  const handleClick = () => {
    if (isActive) {
      // Toggle order if already sorting by this column
      onSort(sortKey, currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending when clicking a new column
      onSort(sortKey, 'desc');
    }
  };

  const getSortIcon = () => {
    if (!isActive) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return currentSortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-amber-600" />
    ) : (
      <ArrowDown size={14} className="text-amber-600" />
    );
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span className={isActive ? 'text-amber-600' : ''}>{label}</span>
        {getSortIcon()}
      </div>
    </th>
  );
}
