import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 10, columns = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
