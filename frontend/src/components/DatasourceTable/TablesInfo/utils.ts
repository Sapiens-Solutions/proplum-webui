import { Row } from "@tanstack/react-table";
import { TableColumnMeta } from "./TablesInfo";

export function getColumnMeta(label: string): TableColumnMeta {
  return { label };
}

// Symbol that is used to show that filter for column needs to search for exact value
export const EXACT_FILTER_START_SYMBOL = "$";

export const searchByStringFilterFunction: (
  row: Row<any>,
  columnId: string,
  filterValue: number | string
) => boolean = (row, columnId, filterValue) => {
  const formattedFilterValue = filterValue.toString();
  if (!formattedFilterValue) return true;

  const isExactSearch =
    filterValue?.toString()?.[0] === EXACT_FILTER_START_SYMBOL;
  const columnValue = row.getValue<string | number>(columnId);
  if (columnValue === null || columnValue == undefined) return false;

  const formattedColumnValue = columnValue.toString();
  if (isExactSearch) {
    return formattedColumnValue === formattedFilterValue.substring(1);
  }

  return formattedColumnValue
    .toLowerCase()
    .includes(formattedFilterValue.toLowerCase());
};

export const booleanFilterFunction: (
  row: Row<any>,
  columnId: string,
  filterValue: string
) => boolean = (row, columnId, filterValue) => {
  const formattedFilterValue = filterValue.toString().toLowerCase();
  if (!formattedFilterValue) return true;

  const boolFilterValue = formattedFilterValue === "true";

  return row.getValue<boolean>(columnId) === boolFilterValue;
};

export function getDefaultGetRowId(
  primaryKeyColumnName: string
): (row: Record<string, any>) => string {
  return (row: Record<string, any>) => row[primaryKeyColumnName];
}

/** {id: 5, name: "John", email: "john5@mail.ru"} => {id: 5} */
export function getDefaultDeleteRowFieldsObject(
  primaryKeyColumnName: string
): (row: Record<string, any>) => Record<string, any> {
  return (row: Record<string, any>) => ({
    [primaryKeyColumnName]: row[primaryKeyColumnName],
  });
}
