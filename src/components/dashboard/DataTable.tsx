"use client";



import { Fragment, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { dash } from "@/lib/dashboard/dashboardClasses";

import { DashboardPanel } from "./DashboardPanel";



export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  caption?: string;
  renderAfterRow?: (row: T) => ReactNode | null;
  stickyFirstColumn?: boolean;
  dense?: boolean;
  mono?: boolean;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records yet.",
  caption,
  renderAfterRow,
  stickyFirstColumn = false,
  dense = false,
  mono = false,
}: DataTableProps<T>) {
  const tableClass = [
    dash.dataTable,
    stickyFirstColumn ? "dashboard-data-table--sticky-first" : "",
    dense ? "dashboard-data-table--dense" : "",
    mono ? "dashboard-data-table--mono" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DashboardPanel pad menuHost className="w-full min-w-0">

      <p className="dashboard-data-table-scroll-hint" aria-hidden>
        <ChevronRight className="h-4 w-4" />
        Swipe for more columns
      </p>

      <div className={dash.dataTableWrap}>

        <table className={tableClass}>

          {caption && <caption className="sr-only">{caption}</caption>}

          <thead>

            <tr>

              {columns.map((col) => (

                <th

                  key={col.key}

                  scope="col"

                  className={col.className}

                >

                  {col.header}

                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {rows.length === 0 ? (

              <tr>

                <td colSpan={columns.length} className={dash.dataTableEmpty}>

                  {emptyMessage}

                </td>

              </tr>

            ) : (
              rows.map((row) => {
                const key = rowKey(row);
                const extra = renderAfterRow?.(row);
                return (
                  <Fragment key={key}>
                    <tr>
                      {columns.map((col) => (
                        <td key={col.key} className={col.className}>
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                    {extra ? (
                      <tr key={`${key}-extra`} className="dashboard-data-table__expand-row">
                        <td colSpan={columns.length}>{extra}</td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </DashboardPanel>

  );

}


