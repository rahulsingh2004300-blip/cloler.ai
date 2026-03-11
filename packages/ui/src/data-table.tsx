import type { ReactNode } from "react";

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  align?: "left" | "right";
};

export type DataTableProps<Row> = {
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  emptyState?: string;
};

export function DataTable<Row>({
  columns,
  rows,
  emptyState = "No rows available.",
}: DataTableProps<Row>) {
  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--cl-color-line)] bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  "px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                  column.align === "right" ? "text-right" : "text-left",
                ].join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-slate-500"
              >
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-[color:var(--cl-color-line)] align-top"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={[
                      "px-4 py-4 text-slate-700",
                      column.align === "right" ? "text-right" : "text-left",
                    ].join(" ")}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
