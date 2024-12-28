import { SELECT_ROW_COLUMN_ID } from "@/components/DatasourceTable/TablesInfo/Columns";
import { useTableStore } from "@/store/tableStore";
import {
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  SortDirection,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const GLOBAL_FILTER_PARAM_NAME = "__global";
const EDIT_MODE_PARAM_NAME = "__edit";

const SORTING_PREFIX = "__sort_";
const PINNING_PREFIX = "__pin_";

type SetParamData = {
  paramName: string;
  value: string | number;
};

type UrlQueryParamsState = {
  columnFilters?: ColumnFiltersState;
  globalFilter?: string;
  columnSortings?: SortingState;
  orderedColumnSortings?: SortingState;
  isEditing?: boolean;
  pagination?: PaginationState;
  columnPinning?: ColumnPinningState;
};

interface UseUrlQueryParamsProps {
  columnNameToOrderNumber: Record<string, number> | undefined;
}

export const useUrlQueryParams = ({
  columnNameToOrderNumber,
}: UseUrlQueryParamsProps): {
  columnFilters: ColumnFiltersState | undefined;
  columnSortings: SortingState | undefined;
  globalFilter: string | undefined;
  isEditing: boolean | undefined;
  columnPinning: ColumnPinningState | undefined;
  onGlobalFilterSet: (globalFilter: string) => void;
  onFilterSet: (filterColumnName: string, value: string | number) => void;
  onFiltersClear: () => void;
  onSortSet: (columnName: string, value: SortDirection | false) => void;
  onEditModeSet: (isEditing: boolean) => void;
  onColumnPin: (pinnedColumnName: string, isPinned: boolean) => void;
} => {
  const columnsOrderMap = useTableStore((state) => state.columnsOrderMap);

  const [searchParams, setSearchParams] = useSearchParams();

  const [urlQueryParamsState, setUrlQueryParamsState] =
    useState<UrlQueryParamsState>({});

  const shouldSkipNextParamsParseRef = useRef<boolean>(false);

  // Parses search params and updates urlQueryParamsState
  useLayoutEffect(() => {
    if (shouldSkipNextParamsParseRef.current) {
      shouldSkipNextParamsParseRef.current = false;
      return;
    }

    const columnFilters: ColumnFiltersState = [];
    let globalFilter: string | undefined = undefined;
    const columnSortings: SortingState = [];
    let isEditing: boolean = false;

    // By default add column for selecting rows to pinned columns
    const columnPinning: ColumnPinningState = {
      left: [SELECT_ROW_COLUMN_ID],
      right: [],
    };

    // Get filters and sortings for table from URL
    searchParams.forEach((value, key) => {
      if (key === GLOBAL_FILTER_PARAM_NAME) {
        // Found global filter in URL
        globalFilter = value;
      } else if (key === EDIT_MODE_PARAM_NAME) {
        // Found if edit mode is on in URL
        isEditing = value === "true";
      } else if (key.startsWith(SORTING_PREFIX)) {
        if (value === "desc" || value === "asc") {
          columnSortings.push({
            id: key.substring(SORTING_PREFIX.length),
            desc: value === "desc",
          });
        }
      } else if (key.startsWith(PINNING_PREFIX)) {
        // Found pinned column in URL
        const columnName = key.substring(PINNING_PREFIX.length);
        columnPinning.left?.push(columnName);
      } else {
        // Found column filter in URL
        columnFilters.push({ id: key, value });
      }
    });

    setUrlQueryParamsState({
      columnFilters,
      globalFilter,
      columnSortings,
      isEditing,
      columnPinning,
    });
  }, [searchParams]);

  useLayoutEffect(() => {
    if (
      !columnNameToOrderNumber ||
      !Object.keys(columnNameToOrderNumber).length ||
      !urlQueryParamsState.columnSortings?.length
    ) {
      setUrlQueryParamsState((prevState) => ({
        ...prevState,
        orderedColumnSortings: prevState.columnSortings,
      }));
      return;
    }

    const orderedColumnSortings = [...urlQueryParamsState.columnSortings];
    orderedColumnSortings.sort(
      (a, b) => columnNameToOrderNumber[a.id] - columnNameToOrderNumber[b.id]
    );

    setUrlQueryParamsState((prevState) => ({
      ...prevState,
      orderedColumnSortings,
    }));
  }, [columnNameToOrderNumber, urlQueryParamsState.columnSortings]);

  const onQueryParamsSet = useCallback(
    (paramsData: SetParamData[]) => {
      setSearchParams(
        (prevSearchParams) => {
          paramsData.forEach((param) => {
            const value = param.value;
            const paramName = param.paramName;

            if (value === "") {
              prevSearchParams.delete(paramName);
            } else {
              prevSearchParams.set(paramName, value.toString());
            }
          });

          return prevSearchParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const onFiltersClear = useCallback(() => {
    setSearchParams(
      (prevSearchParams) => {
        const newSearchParams: URLSearchParams = new URLSearchParams();

        // Clear all params except for edit mode
        const editModeParamValue = prevSearchParams.get(EDIT_MODE_PARAM_NAME);
        if (editModeParamValue) {
          newSearchParams.set(EDIT_MODE_PARAM_NAME, editModeParamValue);
        }

        return newSearchParams;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const onGlobalFilterSet = useCallback(
    (globalFilter: string) => {
      onQueryParamsSet([
        { paramName: GLOBAL_FILTER_PARAM_NAME, value: globalFilter },
      ]);
    },
    [onQueryParamsSet]
  );

  const onSortSet = useCallback(
    (columnName: string, value: SortDirection | false) => {
      shouldSkipNextParamsParseRef.current = true;

      // Update search param in URL
      onQueryParamsSet([
        {
          paramName: SORTING_PREFIX + columnName,
          value: value === false ? "" : value,
        },
      ]);

      // Update sorting state
      setUrlQueryParamsState((prevState) => {
        const copiedColumnSortings: SortingState = prevState.columnSortings
          ? [...prevState.columnSortings]
          : [];
        let newColumnSortings: SortingState;

        if (value === false) {
          // Remove column from list
          newColumnSortings = copiedColumnSortings.filter(
            (sorting) => sorting.id !== columnName
          );
        } else {
          newColumnSortings = copiedColumnSortings;

          const columnSortingParam = newColumnSortings.find(
            (sorting) => sorting.id === columnName
          );
          const isDesc = value === "desc";
          if (columnSortingParam) {
            // Just update value for column
            columnSortingParam.desc = isDesc;
          } else {
            // Add column sorting to list
            newColumnSortings.push({ id: columnName, desc: isDesc });
          }
        }

        return {
          ...prevState,
          columnSortings: newColumnSortings,
        };
      });
    },
    [onQueryParamsSet]
  );

  const onEditModeSet = useCallback(
    (isEditing: boolean) => {
      onQueryParamsSet([
        {
          paramName: EDIT_MODE_PARAM_NAME,
          value: isEditing ? "true" : "false",
        },
      ]);
    },
    [onQueryParamsSet]
  );

  const onFilterSet = useCallback(
    (filterColumnName: string, value: string | number) => {
      onQueryParamsSet([
        {
          paramName: filterColumnName,
          value: value,
        },
      ]);
    },
    [onQueryParamsSet]
  );

  const onColumnPin = useCallback(
    (pinnedColumnName: string, isPinned: boolean) => {
      // Update pinning state
      setUrlQueryParamsState((prevState) => {
        const newColumnPinningState: ColumnPinningState =
          prevState.columnPinning
            ? { ...prevState.columnPinning }
            : { left: [], right: [] };
        if (!newColumnPinningState.left) {
          newColumnPinningState.left = [];
        }

        if (isPinned === false) {
          // Remove column pinning from list
          newColumnPinningState.left = (
            newColumnPinningState.left ?? []
          ).filter((curColumnName) => curColumnName !== pinnedColumnName);
        } else {
          const columnPinningParam = (newColumnPinningState.left ?? []).find(
            (curColumnName) => curColumnName === pinnedColumnName
          );

          if (!columnPinningParam) {
            // Add column pinning to list
            newColumnPinningState.left.push(pinnedColumnName);
          }
        }

        // Sort pinned columns
        newColumnPinningState.left = newColumnPinningState.left?.sort(
          (a, b) => columnsOrderMap[a] - columnsOrderMap[b]
        );

        // Remove pinning params in URL and then add them to use correct order of columns
        if (prevState.columnPinning?.left?.length) {
          shouldSkipNextParamsParseRef.current = true;
          onQueryParamsSet(
            // Skip first element of 'left' because it contains column for row selecting
            prevState.columnPinning.left.slice(1).map((columnName) => ({
              paramName: PINNING_PREFIX + columnName,
              value: "",
            }))
          );
        }

        if (newColumnPinningState.left?.length) {
          shouldSkipNextParamsParseRef.current = true;
          onQueryParamsSet(
            // Skip first element of 'left' because it contains column for row selecting
            newColumnPinningState.left.slice(1).map((columnName) => ({
              paramName: PINNING_PREFIX + columnName,
              value: "1",
            }))
          );
        }

        return {
          ...prevState,
          // Create new array for 'left' to ensure that array pointer is updated for table to react
          columnPinning: { left: [...newColumnPinningState.left], right: [] },
        };
      });
    },
    [onQueryParamsSet, columnsOrderMap]
  );

  return {
    columnFilters: urlQueryParamsState.columnFilters,
    columnSortings: urlQueryParamsState.orderedColumnSortings,
    globalFilter: urlQueryParamsState.globalFilter,
    isEditing: urlQueryParamsState.isEditing,
    columnPinning: urlQueryParamsState.columnPinning,
    onFilterSet,
    onFiltersClear,
    onGlobalFilterSet,
    onSortSet,
    onEditModeSet,
    onColumnPin,
  };
};
