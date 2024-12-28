import {
  ColumnFiltersState,
  SortDirection,
  SortingState,
  Table,
} from "@tanstack/react-table";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { DatasourceColumnDef } from "../TablesInfo/TablesInfo";
import { FilterAddButton } from "./FilterAddButton";
import { ColumnFilterBadge } from "../Badges/ColumnFilterBadge";
import { ClearAllBadge } from "../Badges/ClearAllBadge";
import { ColumnSortingBadge } from "../Badges/ColumnSortingBadge";
import { GlobalSearch } from "./GlobalSearch";
import { CloseAllModalsButton } from "./CloseAllModalsButton";
import { SaveDataButton } from "../Buttons/SaveDataButton";
import { DeleteSelectedRowsButton } from "../Buttons/DeleteSelectedRowsButton";
import { DuplicateSelectedRowsButton } from "../Buttons/DuplicateSelectedRowsButton";
import { AddNewRowButton } from "../Buttons/AddNewRowButton";
import { RefreshTableDataButton } from "../Buttons/RefreshTableDataButton";
import { CancelEditingsButton } from "../Buttons/CancelEditingsButton";
import { ReloadChainsListButton } from "../Buttons/ReloadChainsListButton";

interface DataTableToolbarProps {
  table: Table<any>;
  tableName?: string;
  columnFilters?: ColumnFiltersState;
  columnSortings?: SortingState;
  columns: DatasourceColumnDef[];
  onSortSet: (columnName: string, value: SortDirection | false) => void;
  onFilterSet: (columnName: string, value: string | number) => void;
  onFiltersClear: () => void;
  onGlobalFilterSet: (globalFilter: string) => void;
  globalFilterValue: string;
  columnNameToLabel: Record<string, string>;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  table,
  tableName,
  columnFilters,
  columnSortings,
  columns,
  onSortSet,
  onFilterSet,
  onFiltersClear,
  onGlobalFilterSet,
  globalFilterValue,
  columnNameToLabel,
}: DataTableToolbarProps) => {
  const isFiltered = !!columnFilters?.length;
  const isSorted = !!columnSortings?.length;

  return (
    <div className="relative flex w-full flex-wrap items-center gap-x-[10px] gap-y-[8px] pr-[370px]">
      <GlobalSearch
        globalFilterValue={globalFilterValue}
        onGlobalFilterSet={onGlobalFilterSet}
      />
      <FilterAddButton
        columns={columns}
        onFilterSet={onFilterSet}
        columnNameToLabel={columnNameToLabel}
      />
      {columnFilters?.map((filter) => (
        <ColumnFilterBadge
          key={`${filter.id}-${filter.value}`}
          onFilterSet={onFilterSet}
          filter={filter}
          columnNameToLabel={columnNameToLabel}
        />
      ))}
      {columnSortings?.map((sorting) => (
        <ColumnSortingBadge
          key={`${sorting.id}-${sorting.desc}`}
          sorting={sorting}
          onSortSet={onSortSet}
          columnNameToLabel={columnNameToLabel}
        />
      ))}
      {isFiltered || isSorted || globalFilterValue ? (
        <ClearAllBadge onFiltersClear={onFiltersClear} />
      ) : null}
      <CloseAllModalsButton />
      <ReloadChainsListButton tableName={tableName} />
      <div className="absolute right-0 top-0 flex items-center justify-center gap-x-[10px]">
        <RefreshTableDataButton />
        <SaveDataButton />
        <AddNewRowButton table={table} />
        <DuplicateSelectedRowsButton table={table} />
        <DeleteSelectedRowsButton table={table} />
        <CancelEditingsButton table={table} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
};
