import React, { CSSProperties } from "react";
import cellStyles from "./Cells.module.css";
// @ts-ignore
import AutosizeInput from "react-18-input-autosize";
import { cn } from "@/lib/utils";
import { useCellData } from "./hooks/useCellData";
import { parseNumberValue, parseTextValue } from "@/utils/parse";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BaseCellProps } from "./types";

const inputWrapperStyles: CSSProperties = {
  display: "grid !important",
};

export type TextCellProps = BaseCellProps & {
  type?: "text" | "number";
};

export const TextCell: React.FC<TextCellProps> = ({
  columnName,
  row,
  disabled = false,
  onUpdateCell,
  type = "text",
  isAddedRow = false,
  className,
  doAfterValueChange,
  validationType,
}) => {
  const {
    cellValue,
    isNull,
    isCellEdited,
    isEditingDisabled,
    wasRecentlySaved,
    validationError,
    onChange,
  } = useCellData({
    columnName,
    row,
    disabled,
    onUpdateCell,
    isAddedRow,
    onChangeGetValue: getInputValueOnChange,
    parseInputValue: type === "number" ? parseNumberValue : parseTextValue,
    doAfterValueChange,
    validationType,
  });

  return (
    <div className="group relative">
      <AutosizeInput
        value={isNull ? "null" : cellValue === undefined ? "" : cellValue}
        onChange={onChange}
        spellCheck={false}
        inputClassName={cn(
          "border-solid border-2 border-transparent h-[38px] hover:text-clip",
          cellStyles.cellInput,
          className,
          isEditingDisabled && cellStyles.disabledCell,
          isCellEdited && cellStyles.editedCellInput,
          isAddedRow && cellStyles.addedCellInput,
          validationError && cellStyles.errorCellInput,
          wasRecentlySaved && cellStyles.savedCellInput,
          isNull && cellStyles.nullCellValue
        )}
        style={inputWrapperStyles}
        type={isNull ? "text" : type}
        disabled={isEditingDisabled}
        onWheel={
          type === "number" ? numberInputOnWheelPreventChange : undefined
        }
      />
      <div className={validationError ? "block" : "hidden"}>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100} open={!!validationError}>
            <TooltipTrigger asChild>
              <div className="pointer-events-none absolute top-0 hidden h-[100%] w-[100%] select-none group-focus-within:block group-hover:block" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              className={cn(
                "pointer-events-none hidden select-none text-red-700 group-focus-within:block group-hover:block",
                !validationError && "hidden"
              )}
            >
              <div className="whitespace-pre">{validationError}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

function getInputValueOnChange(
  event: React.ChangeEvent<HTMLInputElement>
): string | null {
  const newValue = event.target.value;
  return newValue.toLowerCase() === "null" ? null : newValue;
}

function numberInputOnWheelPreventChange(
  event: React.WheelEvent<HTMLInputElement>
) {
  // Prevent the input value change
  (event.target as any)?.blur();

  // Refocus immediately, on the next tick (after the current function is done)
  setTimeout(() => {
    (event.target as any)?.focus();
  }, 0);
}
