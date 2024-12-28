import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ColumnFiltersState,
  ColumnPinningState,
  OnChangeFn,
  PaginationState,
  Row,
  RowPinningState,
  RowSelectionState,
  SortDirection,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table } from "@/components/ui/table";
import { DataTableToolbar } from "./Toolbar/DataTableToolbar";
import {
  DatasourceColumnDef,
  DatasourceTableMeta,
} from "./TablesInfo/TablesInfo";
import { DotsSpinner } from "../Spinner/DotsSpinner";
import { DatasourceTableHeaders } from "./DatasourceTableHeaders";
import { DatasourceTableBody } from "./DatasourceTableBody";
import { DatasourceTableFooter } from "./DatasourceTableFooter";
import { UpdateRowFunc } from "@/store/tableStore";
import styles from "./DatasourceTable.module.css";
import { cn } from "@/lib/utils";

export interface DatasourceTableProps {
  tableName?: string;
  tableData: any[] | null;
  columns?: DatasourceColumnDef[];
  columnNameToLabel: Record<string, string>;
  columnFilters?: ColumnFiltersState;
  columnSortings?: SortingState;
  columnPinning?: ColumnPinningState;
  globalFilter?: string;
  isDataPending?: boolean;
  onFilterSet: (columnName: string, value: string | number) => void;
  onGlobalFilterSet: (globalFilter: string) => void;
  onFiltersClear: () => void;
  onSortSet: (columnName: string, value: SortDirection | false) => void;
  onColumnPin?: (pinnedColumnName: string, isPinned: boolean) => void;
  hasRowSelectionColumn?: boolean;
  tableDataRequestError?: string;
  // Can table be edited or not
  isTableEditable?: boolean;
  onUpdateTableCell: UpdateRowFunc;
  rowPinning: RowPinningState;
  onSetRowPinning: React.Dispatch<React.SetStateAction<RowPinningState>>;
  scrollTableToBottomTrigger?: boolean;
  getRowId: (
    originalRow: Record<string, any>,
    index: number,
    parent?: Row<any> | undefined
  ) => string;
  autoResetPageIndex: boolean;
}

export const DatasourceTable: React.FC<DatasourceTableProps> = ({
  tableName,
  tableData,
  columns,
  columnNameToLabel,
  columnFilters,
  columnSortings,
  columnPinning,
  globalFilter,
  isDataPending,
  onFilterSet,
  onGlobalFilterSet,
  onFiltersClear,
  onSortSet,
  onColumnPin = () => {},
  hasRowSelectionColumn = true,
  tableDataRequestError,
  isTableEditable = false,
  onUpdateTableCell,
  rowPinning,
  onSetRowPinning,
  scrollTableToBottomTrigger,
  getRowId,
  autoResetPageIndex,
}) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState<number>(1);

  const pinnedRowsCount = useMemo<number>(() => {
    if (!rowPinning) return 0;

    const topRows = rowPinning.top ?? [];
    const bottomRows = rowPinning.bottom ?? [];

    return topRows.length + bottomRows.length;
  }, [rowPinning]);

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updaterOrValue) => {
      let newSortings: SortingState;
      if (typeof updaterOrValue === "function") {
        newSortings = updaterOrValue(columnSortings ?? []);
      } else {
        newSortings = updaterOrValue;
      }

      const columnNameToSort: Record<string, boolean | undefined> = {};
      columnSortings?.forEach((sorting) => {
        columnNameToSort[sorting.id] = sorting.desc;
      });

      newSortings.forEach((sort) => {
        const prevSortValue = columnNameToSort[sort.id];
        if (prevSortValue === true && sort.desc === false) {
          // If currently using "desc" sorting for column, set sorting state for column to "no sort"
          onSortSet(sort.id, false);
        } else {
          onSortSet(sort.id, sort.desc ? "desc" : "asc");
        }
      });
    },
    [onSortSet, columnSortings]
  );

  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updaterOrValue) => {
      let newFilters: ColumnFiltersState;
      if (typeof updaterOrValue === "function") {
        newFilters = updaterOrValue(columnFilters ?? []);
      } else {
        newFilters = updaterOrValue;
      }

      newFilters.forEach((filter) =>
        onFilterSet(filter.id, filter.value as string)
      );
    },
    [onFilterSet, columnFilters]
  );

  const table = useReactTable({
    data: tableData ?? [],
    rowCount: Math.max(0, (tableData?.length ?? 0) - pinnedRowsCount),
    columns: columns ?? [],

    onSortingChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: onGlobalFilterSet,
    onPaginationChange: setPagination,
    onRowPinningChange: onSetRowPinning,
    getRowId,

    meta: {
      updateCell: onUpdateTableCell,
      isEditing: isTableEditable,
      onColumnPin,
    } as DatasourceTableMeta,

    state: {
      sorting: columnSortings,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilter ?? "",
      pagination,
      rowPinning,
      columnPinning,
    },

    pageCount,
    autoResetPageIndex,
    globalFilterFn: "includesString",
    enableSortingRemoval: true,
    enableMultiSort: true,
    enableRowPinning: true,

    // Always show pinned rows despite page size, page index and filtering
    keepPinnedRows: true,
  });

  // Partially resets table state when changing table name
  useEffect(() => {
    setRowSelection({});
    setColumnVisibility({});
  }, [tableName]);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Scroll table to bottom on trigger
  useEffect(() => {
    if (scrollTableToBottomTrigger != undefined && tableContainerRef.current) {
      tableContainerRef.current.scrollTop =
        tableContainerRef.current.scrollHeight;
    }
  }, [scrollTableToBottomTrigger]);

  // Reset page when changing filters, table name
  useLayoutEffect(() => {
    setPagination((prevState) => ({ ...prevState, pageIndex: 0 }));
  }, [tableName, columnFilters, globalFilter]);

  // Update total page count
  useLayoutEffect(() => {
    const pageCount = Math.ceil(
      table.getFilteredRowModel().rows.length / pagination.pageSize
    );
    setPageCount(pageCount);
  }, [
    pagination.pageSize,
    table,
    tableName,
    tableData?.length,
    globalFilter,
    columnFilters,
  ]);

  return tableDataRequestError ? (
    <div className="text-[18px] font-medium text-red-600">
      <div>Не удалось получить данные таблицы {tableName}</div>
      <div className="mt-[8px]">{tableDataRequestError}</div>
    </div>
  ) : !table || !tableData || !columns ? (
    <div
      className={cn(
        styles.tableContainer,
        "flex w-full items-center justify-center"
      )}
    >
      <DotsSpinner color="#0f4c85" size={150} />
    </div>
  ) : (
    <div className="w-full">
      <div className="py-4">
        <DataTableToolbar
          table={table}
          tableName={tableName}
          columns={hasRowSelectionColumn ? columns.slice(1) : columns}
          columnFilters={columnFilters}
          columnSortings={columnSortings}
          onSortSet={onSortSet}
          onFilterSet={onFilterSet}
          onFiltersClear={onFiltersClear}
          onGlobalFilterSet={onGlobalFilterSet}
          globalFilterValue={globalFilter ?? ""}
          columnNameToLabel={columnNameToLabel}
        />
      </div>
      <div className="rounded-md border shadow-md">
        <div
          className={cn(
            styles.tableContainer,
            "relative overflow-auto scroll-smooth rounded-md"
          )}
          ref={tableContainerRef}
        >
          <Table className="!border-separate !border-spacing-0">
            <DatasourceTableHeaders
              table={table}
              isDataPending={isDataPending}
            />
            <DatasourceTableBody
              table={table}
              columns={columns}
              isDataPending={isDataPending}
            />
          </Table>
        </div>
      </div>
      <DatasourceTableFooter table={table} />
    </div>
  );
};
