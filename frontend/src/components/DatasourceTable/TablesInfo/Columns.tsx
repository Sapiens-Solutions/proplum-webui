import { Checkbox } from "@/components/ui/checkbox";
import {
  DatasourceColumnDef,
  DatasourceTableCellContext,
  DatasourceTableMeta,
} from "./TablesInfo";
import { DataTableColumnHeader } from "../DatasourceTableColumnHeader";
import { FilterFnOption, HeaderContext } from "@tanstack/react-table";
import {
  booleanFilterFunction,
  getColumnMeta,
  searchByStringFilterFunction,
} from "./utils";
import { cn } from "@/lib/utils";
import { JsonCell } from "../Cells/JsonCell";
import { TextCell } from "../Cells/TextCell";
import { BooleanCell } from "../Cells/BooleanCell";
import { SelectValueFromOtherTableCell } from "../Cells/SelectValueFromOtherTableCell";
import { TableLinkCell } from "../Cells/TableLinkCell";
import { ArrayCell } from "../Cells/ArrayCell";
import { GenerateLoadIdButtonCell } from "../Cells/GenerateLoadIdButtonCell";
import { AirflowJobCell } from "../Cells/AirflowJobCell";
import { ColumnValidationType } from "@/types";
import { DagEditorCell } from "../Cells/DagEditorCell";

// Returns renderer for column header
export function getColumnDefHeaderRender({
  label,
  canSort = true,
  canFilter = true,
  className = "tableHeaderButton",
  isContextMenuVisible = false,
}: {
  label: string;
  canSort?: boolean;
  canFilter?: boolean;
  className?: string;
  isContextMenuVisible?: boolean;
}): ({ column, table }: HeaderContext<any, unknown>) => JSX.Element {
  return ({ column, table }) => {
    return (
      <DataTableColumnHeader
        column={column}
        title={label}
        canSort={canSort}
        canFilter={canFilter}
        className={className}
        comment={(column.columnDef as DatasourceColumnDef).comment}
        onColumnPin={(table.options.meta as DatasourceTableMeta).onColumnPin}
        isContextMenuVisible={isContextMenuVisible}
      />
    );
  };
}

export const SELECT_ROW_COLUMN_ID = "__select_row_column";

export const SelectRowColumn: DatasourceColumnDef = {
  id: SELECT_ROW_COLUMN_ID,
  accessorKey: SELECT_ROW_COLUMN_ID,
  label: "Select",
  cellClassName: "min-w-[48px] !px-[0] !py-0 bg-gray-50",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Выбрать все строки"
      className="mt-[4px]"
      tabIndex={-1}
    />
  ),
  // Size is needed for calculating left offset for pinned columns
  size: 48,
  cell: ({ row, visibleRowIndex, isAddedRow }) => {
    const isSeleted = row.getIsSelected();
    return (
      <div className="group relative mx-auto flex h-max w-fit items-center justify-center">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 m-auto flex items-center justify-center font-[300] opacity-30 group-hover:invisible">
          {isAddedRow ? "+" : (visibleRowIndex ?? 0) + 1}
        </div>
        <Checkbox
          checked={isSeleted}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Выбрать строку"
          className={cn(
            "m-0",
            isSeleted ? "visible" : "invisible mt-[4px] group-hover:visible"
          )}
          tabIndex={-1}
        />
      </div>
    );
  },
  enableSorting: false,
  enableHiding: false,
};

type BaseColumnDefProps = {
  columnName: string;
  label: string;
  isEditable?: boolean;
  canFilter?: boolean;
  canSort?: boolean;
  filterFn?: FilterFnOption<any>;
  cellClassName?: string;
  shouldValidateValue?: boolean;
  /** If set to non-null value values in cells will be validated with api requests */
  validationType?: ColumnValidationType | null;
  isContextMenuVisible?: boolean;
};

function getBaseColumnDefProps({
  columnName,
  label,
  canFilter,
  canSort,
  filterFn,
  cellClassName = "tableDataCell",
  isContextMenuVisible = false,
}: BaseColumnDefProps): Pick<
  DatasourceColumnDef,
  | "accessorKey"
  | "label"
  | "cellClassName"
  | "meta"
  | "header"
  | "filterFn"
  | "size"
  | "minSize"
  | "maxSize"
> {
  return {
    accessorKey: columnName,
    label,
    cellClassName,
    meta: getColumnMeta(label),
    header: getColumnDefHeaderRender({
      label,
      canSort,
      canFilter,
      isContextMenuVisible,
    }),
    filterFn,
  };
}

type TextColumnDefProps = BaseColumnDefProps & {
  type?: "text" | "number";
};

export function getTextColumnDef({
  columnName,
  label,
  canFilter = true,
  isEditable = true,
  type = "text",
  filterFn = searchByStringFilterFunction,
  validationType,
  isContextMenuVisible,
}: TextColumnDefProps): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter,
      canSort: true,
      filterFn,
      isContextMenuVisible,
    }),
    cell: ({ row, table, isRowDeleted, isAddedRow, column }) => (
      <TextCell
        columnName={columnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        disabled={
          isRowDeleted ||
          !isEditable ||
          !(table.options.meta as DatasourceTableMeta).isEditing
        }
        isAddedRow={isAddedRow}
        type={type}
        validationType={
          // If validation type is set to null don't use prop from columnDef
          validationType !== undefined
            ? validationType ?? undefined
            : (column.columnDef as DatasourceColumnDef).validationType
        }
      />
    ),
  };
}

export function getNumberColumnDef({
  columnName,
  label,
  canFilter = true,
  isEditable = true,
  isContextMenuVisible = false,
}: {
  columnName: string;
  label: string;
  canFilter?: boolean;
  isEditable?: boolean;
  isContextMenuVisible?: boolean;
}): DatasourceColumnDef {
  return getTextColumnDef({
    columnName,
    label,
    canFilter,
    isEditable,
    type: "number",
    isContextMenuVisible,
  });
}

export function getTextArrayColumnDef({
  columnName,
  label,
  canFilter = true,
}: {
  columnName: string;
  label: string;
  canFilter?: boolean;
}): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter,
      canSort: true,
      filterFn: searchByStringFilterFunction,
    }),
    cell: ({ row, table, isAddedRow, isEditable = true }) => (
      <ArrayCell
        columnName={columnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        valueType="text"
        isAddedRow={isAddedRow}
        disabled={
          !isEditable || !(table.options.meta as DatasourceTableMeta).isEditing
        }
      />
    ),
  };
}

export function getJsonColumnDef({
  columnName,
  label,
}: {
  columnName: string;
  label: string;
}): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter: false,
      canSort: true,
      filterFn: searchByStringFilterFunction,
    }),
    cell: ({ row, isAddedRow, table, isRowDeleted, isEditable = true }) => (
      <JsonCell
        columnName={columnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        disabled={
          isRowDeleted ||
          !isEditable ||
          !(table.options.meta as DatasourceTableMeta).isEditing
        }
        isAddedRow={isAddedRow}
      />
    ),
  };
}

export function getBooleanColumnDef({
  columnName,
  label,
  canFilter = true,
  isEditable = true,
}: {
  columnName: string;
  label: string;
  canFilter?: boolean;
  isEditable?: boolean;
}): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter,
      canSort: true,
      filterFn: booleanFilterFunction,
    }),
    cell: ({ row, table, isRowDeleted, isAddedRow }) => (
      <BooleanCell
        columnName={columnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        isAddedRow={isAddedRow}
        disabled={
          isRowDeleted ||
          !isEditable ||
          !(table.options.meta as DatasourceTableMeta).isEditing
        }
      />
    ),
  };
}

export function getOuterLinkColumnDef(
  accessorKey: string,
  label: string,
  cellRenderer: (context: DatasourceTableCellContext) => JSX.Element
): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName: accessorKey,
      label,
      canSort: false,
      filterFn: undefined,
    }),
    cell: cellRenderer,
  };
}

export function getTableLinkColumnDef(
  accessorKey: string,
  label: string,
  linkTableName: string,
  cellLabel: string,
  linkColumnName: string
): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName: accessorKey,
      label,
      canSort: false,
      filterFn: undefined,
    }),
    cell: ({ row, isAddedRow }) => (
      <TableLinkCell
        row={row}
        linkTableName={linkTableName}
        linkColumnName={linkColumnName}
        cellLabel={cellLabel}
        isAddedRow={isAddedRow}
      />
    ),
  };
}

export function getSelectValueFromOtherTableColumn({
  columnName,
  referredTableName,
  referredValueColumnName,
  referredDescriptionColumnName,
  label,
  canFilter = true,
  isEditable = true,
  valueType,
  filterFn = searchByStringFilterFunction,
}: {
  columnName: string;
  referredTableName: string;
  referredValueColumnName: string;
  referredDescriptionColumnName?: string;
  label: string;
  canFilter?: boolean;
  isEditable?: boolean;
  valueType: "text" | "number";
  filterFn?: FilterFnOption<any>;
}): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter,
      canSort: true,
      filterFn,
    }),
    cell: ({ row, table, isRowDeleted, isAddedRow }) => (
      <SelectValueFromOtherTableCell
        columnName={columnName}
        referredTableName={referredTableName}
        referredValueColumnName={referredValueColumnName}
        referredDescriptionColumnName={referredDescriptionColumnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        disabled={
          isRowDeleted ||
          !isEditable ||
          !(table.options.meta as DatasourceTableMeta).isEditing
        }
        isAddedRow={isAddedRow}
        valueType={valueType}
      />
    ),
  };
}

export function getGenerateLoadIdColumnDef({
  columnName,
  label,
}: {
  columnName: string;
  label: string;
}): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter: false,
      canSort: false,
    }),
    cell: ({ row, isAddedRow }) => (
      <GenerateLoadIdButtonCell row={row} isAddedRow={isAddedRow} />
    ),
  };
}

type TextColumnWithAirflowIconLinkDefProps = TextColumnDefProps;

export function getTextColumnWithAirflowIconLinkDef({
  columnName,
  label,
  canFilter = true,
  isEditable = true,
  type = "text",
  filterFn = searchByStringFilterFunction,
}: TextColumnWithAirflowIconLinkDefProps): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter,
      canSort: true,
      filterFn,
    }),
    cell: ({ row, table, isRowDeleted, isAddedRow }) => (
      <AirflowJobCell
        columnName={columnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        disabled={
          isRowDeleted ||
          !isEditable ||
          !(table.options.meta as DatasourceTableMeta).isEditing
        }
        isAddedRow={isAddedRow}
        type={type}
      />
    ),
  };
}

export function getDagEditorColumnDef({
  columnName,
  label,
}: {
  columnName: string;
  label: string;
}): DatasourceColumnDef {
  return {
    ...getBaseColumnDefProps({
      columnName,
      label,
      canFilter: false,
      canSort: true,
      filterFn: searchByStringFilterFunction,
    }),
    cell: ({ row, isAddedRow, table, isRowDeleted, isEditable = true }) => (
      <DagEditorCell
        columnName={columnName}
        row={row}
        onUpdateCell={(table.options.meta as DatasourceTableMeta).updateCell}
        disabled={
          isRowDeleted ||
          !isEditable ||
          !(table.options.meta as DatasourceTableMeta).isEditing
        }
        isAddedRow={isAddedRow}
      />
    ),
  };
}
