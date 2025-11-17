/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface Column {
  key: string;
  label: string | React.ReactNode;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const DataTable = ({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = "No data available"
}: DataTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D4D4D4] p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0082C9]"></div>
          <span className="ml-3 text-b2 text-[#9E9E9E]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#D4D4D4] overflow-hidden">
      {data.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-b2 text-[#9E9E9E]">{emptyMessage}</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F9FC] border-b border-[#D4D4D4]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-4 text-left text-b2m text-[#141414] font-medium"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    border-b border-[#F0F0F0] hover:bg-[#F5F9FC] transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-b2 text-[#141414]">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
