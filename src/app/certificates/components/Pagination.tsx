import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </span>
        <span className="ml-4">
          Total <span className="font-medium">{totalCount}</span> records
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            hasPreviousPage
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            hasNextPage
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
