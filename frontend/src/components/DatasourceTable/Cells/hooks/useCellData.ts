import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { UpdateRowFunc, useTableStore } from "@/store/tableStore";
import { Row } from "@tanstack/react-table";
import { ColumnValidationType } from "@/types";
import { validate } from "@/api";

const VALIDATE_ERROR_DEBOUNCE_MS = 250;

interface UseCellDataProps {
  columnName: string;
  row: Row<any>;
  disabled?: boolean;
  onUpdateCell: UpdateRowFunc;
  parseInputValue: (value: any) => any;
  onChangeGetValue: (...args: any) => any;
  isAddedRow?: boolean;
  doAfterValueChange?: (value: any) => void;
  /** If set to non-null type, value in cell will be validated after change with api requests */
  validationType?: ColumnValidationType;
}

export function useCellData({
  columnName,
  row,
  onUpdateCell,
  disabled,
  isAddedRow,
  onChangeGetValue,
  parseInputValue,
  doAfterValueChange,
  validationType,
}: UseCellDataProps): {
  cellValue: any;
  isNull: boolean;
  isCellEdited: boolean;
  isEditingDisabled: boolean;
  wasRecentlySaved: boolean;
  validationError?: string | null;
  onChange: (...args: any[]) => void;
} {
  const getCellValue = useTableStore((state) => state.getCellValue);
  const setValidationErrorToStore = useTableStore(
    (state) => state.setValidationError
  );
  const cellsRerenderTrigger = useTableStore(
    (state) => state.cellsRerenderTrigger
  );

  const isEditingDisabled = useMemo(
    () => !!disabled && !isAddedRow,
    [disabled, isAddedRow]
  );

  const [cellState, setCellState] = useState<{
    value: any;
    isEdited: boolean;
    validationError: string | null | undefined;
  }>({ value: "", isEdited: false, validationError: undefined });
  const [wasRecentlySaved, setWasRecentlySaved] = useState<boolean>(false);

  const validationErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useLayoutEffect(() => {
    const { value, isEdited, wasRecentlySaved, validationError } = getCellValue(
      row.original,
      columnName
    );

    setCellState({ value, isEdited, validationError });
    doAfterValueChange?.(value);

    if (wasRecentlySaved) {
      setWasRecentlySaved(true);
      const timeoutId = setTimeout(() => setWasRecentlySaved(false), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [
    getCellValue,
    row.original,
    columnName,
    cellsRerenderTrigger,
    doAfterValueChange,
  ]);

  const onChange = useCallback(
    (...args: any[]) => {
      if (isEditingDisabled) return;

      const newValue = onChangeGetValue(...args);
      const parsedValue = parseInputValue(newValue);

      const { isEdited } = onUpdateCell({
        row: row.original,
        columnName,
        value: parsedValue,
      });

      setCellState({ value: newValue, isEdited, validationError: undefined });
      doAfterValueChange?.(newValue);

      // Validate new value if validation type is specified
      if (validationType !== undefined) {
        if (validationErrorTimeoutRef.current) {
          clearTimeout(validationErrorTimeoutRef.current);
        }

        // Use debounce for validation
        validationErrorTimeoutRef.current = setTimeout(async () => {
          const errorMessage = await validate({
            value: newValue,
            type: validationType,
          });

          setCellState((prevState) => ({
            ...prevState,
            validationError: errorMessage,
          }));

          setValidationErrorToStore({
            row: row.original,
            columnName,
            error: errorMessage,
          });
        }, VALIDATE_ERROR_DEBOUNCE_MS);
      }
    },
    [
      columnName,
      doAfterValueChange,
      onChangeGetValue,
      onUpdateCell,
      parseInputValue,
      setValidationErrorToStore,
      row.original,
      validationType,
      isEditingDisabled,
    ]
  );

  return {
    cellValue: cellState.value,
    isNull: cellState.value === null,
    isCellEdited: cellState.isEdited,
    validationError: cellState.validationError,
    onChange,
    isEditingDisabled,
    wasRecentlySaved,
  };
}
