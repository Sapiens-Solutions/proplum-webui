import React from "react";
import { cn } from "@/lib/utils";
import { DatasourceTable } from "@/components/DatasourceTable/DatasourceTable";
import { Header } from "@/components/Header/Header";
import { useTableStore } from "@/store/tableStore";
import { TABLE_NAME_TO_LABEL } from "@/const";
import { useDatasourceTableData } from "./hooks/useDatasourceTableData";
import { useUrlQueryParams } from "./hooks/useUrlQueryParams";
import { DotsSpinner } from "@/components/Spinner/DotsSpinner";
import tableStyles from "@/components/DatasourceTable/DatasourceTable.module.css";

export const DatasourceTablePage: React.FC = () => {
  const tableName = useTableStore((state) => state.tableName);
  const tableData = useTableStore((state) => state.tableData);
  const columnDefs = useTableStore((state) => state.columnDefs);
  const columnNameToLabel = useTableStore((state) => state.columnNameToLabel);
  const columnNameToOrderNumber = useTableStore(
    (state) => state.columnNameToOrderNumber
  );
  const isTableDataPending = useTableStore((state) => state.isTableDataPending);
  const tableDataRequestError = useTableStore(
    (state) => state.tableDataRequestError
  );
  const isTableEditable = useTableStore((state) => state.isTableEditable);
  const updateRow = useTableStore((state) => state.updateRow);
  const rowPinning = useTableStore((state) => state.rowPinning);
  const onSetRowPinning = useTableStore((state) => state.onSetRowPinning);
  const scrollTableToBottomTrigger = useTableStore(
    (state) => state.scrollTableToBottomTrigger
  );
  const getRowId = useTableStore((state) => state.getRowId);

  const {
    columnFilters,
    globalFilter,
    columnSortings,
    columnPinning,
    onFilterSet,
    onFiltersClear,
    onGlobalFilterSet,
    onSortSet,
    onColumnPin,
  } = useUrlQueryParams({ columnNameToOrderNumber });

  useDatasourceTableData();

  return (
    <>
      <Header
        label={tableName ? TABLE_NAME_TO_LABEL[tableName] ?? tableName : ""}
      />
      <div className="p-4">
        {columnFilters !== undefined ? (
          <DatasourceTable
            key="main-datasource-table"
            tableName={tableName}
            tableData={tableData}
            columns={columnDefs}
            isDataPending={isTableDataPending}
            columnFilters={columnFilters}
            columnSortings={columnSortings}
            columnNameToLabel={columnNameToLabel}
            onFilterSet={onFilterSet}
            onFiltersClear={onFiltersClear}
            globalFilter={globalFilter}
            onGlobalFilterSet={onGlobalFilterSet}
            onSortSet={onSortSet}
            tableDataRequestError={tableDataRequestError}
            isTableEditable={isTableEditable}
            onUpdateTableCell={updateRow}
            rowPinning={rowPinning}
            onSetRowPinning={onSetRowPinning}
            scrollTableToBottomTrigger={scrollTableToBottomTrigger}
            getRowId={getRowId}
            autoResetPageIndex={false}
            columnPinning={columnPinning}
            onColumnPin={onColumnPin}
          />
        ) : (
          <div
            className={cn(
              tableStyles.tableContainer,
              "flex w-full items-center justify-center"
            )}
          >
            <DotsSpinner color="#0f4c85" size={150} />
          </div>
        )}
      </div>
    </>
  );
};
