"use client";
// Reusable data table: columns via render functions, loading skeletons,
// empty state, and optional pagination footer.

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T & string;
  loading?: boolean;
  empty?: React.ReactNode;
  skeletonRows?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading,
  empty,
  skeletonRows = 5,
  page,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        empty ?? (
          <div className="p-12 text-center">
            <p className="text-text-muted">No data available.</p>
          </div>
        )
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-xs text-text-muted uppercase tracking-wider border-b border-card-border">
              {columns.map((c) => (
                <th key={c.key} className="text-left p-4">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="border-b border-card-border/60 hover:bg-hover-bg/50 transition-colors"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`p-4 ${c.className ?? ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex justify-center gap-2 p-4 border-t border-card-border">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === (page ?? 1)
                    ? "bg-accent-primary text-white"
                    : "bg-surface-raised text-text-secondary hover:bg-hover-bg"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
