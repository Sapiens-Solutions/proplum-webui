import React from "react";
import { TableHead, TableHeader, TableRow } from "../ui/table";
import { Table, flexRender } from "@tanstack/react-table";
import styles from "./DatasourceTableHeaders.module.css";
import { getCommonPinningStyles } from "@/utils/table";

interface DatasourceTableHeadersProps {
  table: Table<any>;
  isDataPending?: boolean;
}

export const DatasourceTableHeaders: React.FC<DatasourceTableHeadersProps> = ({
  table,
  isDataPending,
}) => {
  return (
    <TableHeader className={styles.tableHeader}>
      {isDataPending
        ? null
        : table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={styles.tableHeaderRow}>
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned();

                return (
                  <TableHead
                    key={header.id}
                    style={getCommonPinningStyles(header.column)}
                    className={isPinned ? "!bg-[#f9fafb]" : "!bg-white"}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
    </TableHeader>
  );
};
