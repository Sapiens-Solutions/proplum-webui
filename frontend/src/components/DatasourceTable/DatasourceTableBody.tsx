import React, { useEffect, useState } from "react";
import { TableBody, TableCell, TableRow } from "../ui/table";
import { Row, Table, flexRender } from "@tanstack/react-table";
import {
  DatasourceColumnDef,
  DatasourceTableCellContext,
} from "./TablesInfo/TablesInfo";
import { Skeleton } from "../ui/skeleton";
import { TableState, useTableStore } from "@/store/tableStore";
import styles from "./DatasourceTableBody.module.css";
import { cn } from "@/lib/utils";
import { getCommonPinningStyles } from "@/utils/table";

const LoadingTableRow: React.FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-[20px] w-[100px] rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[20px] w-[150px] rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[20px] w-[90px] rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[20px] w-[200px] rounded-full" />
    </TableCell>
  </TableRow>
);

const LoadingTableBody: React.FC = () => {
  return Array.from(Array(9).keys()).map((_, index) => (
    <LoadingTableRow key={index} />
  ));
};

interface BodyRowProps {
  row: Row<any>;
  visibleRowIndex: number;
  zeroRowIndex: number;
  getRowState: TableState["getRowState"];
}

const BodyRow: React.FC<BodyRowProps> = ({
  row,
  visibleRowIndex,
  zeroRowIndex,
  getRowState,
}) => {
  const { wasRecentlyDeleted, wasRecentlyUploaded, isAddedRow } = getRowState(
    row.original
  );

  const isSelected = row.getIsSelected();

  return (
    <TableRow
      data-state={isSelected && "selected"}
      className={cn(
        styles.tableRow,
        isSelected && styles.selectedRow,
        isAddedRow && styles.addedRow,
        wasRecentlyDeleted && styles.recentlyDeletedRow,
        wasRecentlyUploaded && styles.recentlyUploadedRow
      )}
    >
      {row.getVisibleCells().map((cell) => {
        const cellContext = cell.getContext() as DatasourceTableCellContext;
        cellContext.visibleRowIndex = isAddedRow
          ? -1
          : zeroRowIndex + visibleRowIndex;
        cellContext.isAddedRow = isAddedRow;

        const column = cell.column;
        const isPinned = column.getIsPinned();
        const isLastLeftPinnedColumn =
          isPinned === "left" && column.getIsLastColumn("left");

        return (
          <TableCell
            key={cell.id}
            style={getCommonPinningStyles(cell.column)}
            className={
              (cell.column.columnDef as DatasourceColumnDef).cellClassName
            }
            data-pinned={isPinned}
            data-is-last-left-pinned={isLastLeftPinnedColumn}
          >
            {flexRender(cell.column.columnDef.cell, cellContext)}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

interface DatasourceTableBodyProps {
  table: Table<any>;
  columns?: DatasourceColumnDef[];
  isDataPending?: boolean;
}

export const DatasourceTableBody: React.FC<DatasourceTableBodyProps> = ({
  table,
  columns,
  isDataPending,
}) => {
  const getRowState = useTableStore((state) => state.getRowState);
  const rowsRerenderTrigger = useTableStore(
    (state) => state.rowsRerenderTrigger
  );
  const shouldUseRowIndexAsRowKey = useTableStore(
    (state) => state.shouldUseRowIndexAsRowKey
  );

  const [, setRerenderTrigger] = useState<boolean>(false);

  useEffect(() => {
    setRerenderTrigger((prevValue) => !prevValue);
  }, [rowsRerenderTrigger]);

  const pagination = table.getState().pagination;
  const zeroRowIndex = pagination.pageIndex * pagination.pageSize;

  const centerRows = table.getCenterRows();
  const bottomRows = table.getBottomRows();

  const centerRowsLength = centerRows?.length ?? 0;

  return (
    <TableBody>
      {isDataPending ? (
        <LoadingTableBody />
      ) : (
        <>
          {centerRows?.map((row, visibleRowIndex) => (
            <BodyRow
              key={shouldUseRowIndexAsRowKey ? visibleRowIndex : row.id}
              row={row}
              visibleRowIndex={visibleRowIndex}
              zeroRowIndex={zeroRowIndex}
              getRowState={getRowState}
            />
          )) ?? null}
          {bottomRows?.map((row, visibleRowIndex) => (
            <BodyRow
              key={
                shouldUseRowIndexAsRowKey
                  ? visibleRowIndex + centerRowsLength
                  : row.id
              }
              row={row}
              visibleRowIndex={visibleRowIndex + centerRowsLength}
              zeroRowIndex={zeroRowIndex}
              getRowState={getRowState}
            />
          )) ?? null}
        </>
      )}
      {!centerRows?.length && !bottomRows?.length ? (
        <TableRow>
          <TableCell
            colSpan={columns?.length ?? 0}
            className="h-24 text-center"
          >
            Данные отсутствуют
          </TableCell>
        </TableRow>
      ) : null}
    </TableBody>
  );
};
