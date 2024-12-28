import React from "react";
import { useCellData } from "./hooks/useCellData";
import { ColumnValue } from "@/store/tableStore";
import selectStyles from "./Select.module.css";
import cellStyles from "./Cells.module.css";
import { cn } from "@/lib/utils";
import { SelectFromColumnValues } from "@/components/SelectFromColumnValues/SelectFromColumnValues";
import { BaseCellProps } from "./types";

type SelectValueFromOtherTableCellProps = BaseCellProps & {
  referredTableName: string;
  referredValueColumnName: string;
  referredDescriptionColumnName?: string;
  valueType: "text" | "number";
};

export const SelectValueFromOtherTableCell: React.FC<
  SelectValueFromOtherTableCellProps
> = ({
  columnName,
  referredTableName,
  referredValueColumnName,
  referredDescriptionColumnName,
  row,
  disabled = false,
  onUpdateCell,
  isAddedRow = false,
  valueType,
}) => {
  const {
    cellValue,
    isCellEdited,
    isEditingDisabled,
    wasRecentlySaved,
    onChange,
  } = useCellData({
    columnName,
    row,
    disabled,
    onUpdateCell,
    isAddedRow,
    onChangeGetValue: getSelectedValueOnChange,
    parseInputValue: getParseSelectedValueFunc(valueType),
  });

  return (
    <SelectFromColumnValues
      value={cellValue}
      onChange={onChange}
      columnName={columnName}
      referredTableName={referredTableName}
      referredValueColumnName={referredValueColumnName}
      referredDescriptionColumnName={referredDescriptionColumnName}
      disabled={isEditingDisabled}
      selectClassNames={{
        container: () => selectStyles.container,
        control: (state) =>
          cn(
            selectStyles.control,
            !isEditingDisabled &&
              !isCellEdited &&
              !isAddedRow &&
              !wasRecentlySaved &&
              cellStyles.untouchedCellInput,
            state.isFocused && cellStyles.focusedUntouchedCellInput,
            isEditingDisabled && cellStyles.disabledCell,
            isCellEdited && cellStyles.editedCellInput,
            isAddedRow && cellStyles.addedCellInput,
            isAddedRow && state.isFocused && cellStyles.focusedAddedCellInput,
            wasRecentlySaved && cellStyles.savedCellInput
          ),
        menu: () => selectStyles.menu,
        indicatorsContainer: () => selectStyles.indicatorsContainer,
        singleValue: () => selectStyles.singleValue,
      }}
    />
  );
};

function getSelectedValueOnChange(option: ColumnValue) {
  return option;
}

function getParseSelectedValueFunc(type: "text" | "number") {
  return type === "number"
    ? (option: ColumnValue) => Number(option.value)
    : (option: ColumnValue) => option.value;
}
