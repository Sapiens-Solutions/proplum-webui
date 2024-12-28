import React, { useCallback } from "react";
import CreatableSelect from "react-select/creatable";
import { CSSObjectWithLabel, GroupBase, StylesConfig } from "react-select";
import { useCellData } from "./hooks/useCellData";
import { ColumnValue } from "@/store/tableStore";
import styles from "./ArrayCell.module.css";
import cellStyles from "./Cells.module.css";
import { cn } from "@/lib/utils";
import { BaseCellProps } from "./types";

const VALUE_CONTAINER_STYLES: CSSObjectWithLabel = {
  flexWrap: "nowrap",
};

const SELECT_STYLES: StylesConfig<string, boolean, GroupBase<string>> = {
  // Change initial styles from "@emotion" library that are used by "react-select"
  valueContainer: (props) => ({ ...props, ...VALUE_CONTAINER_STYLES }),
};

type ArrayCellProps = BaseCellProps & {
  valueType: "text" | "number";
};

export const ArrayCell: React.FC<ArrayCellProps> = ({
  columnName,
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
    parseInputValue: parseSelectedValues,
  });

  const onCreateOption = useCallback(
    (inputValue: string): void => {
      const parsedInputValue =
        valueType === "number" ? Number(inputValue) : inputValue;
      onChange(
        cellValue?.length
          ? [...cellValue, parsedInputValue]
          : [parsedInputValue]
      );
    },
    [onChange, cellValue, valueType]
  );

  return (
    <CreatableSelect
      isMulti
      maxMenuHeight={600}
      getOptionValue={(option) =>
        typeof option === "string" ? option : option.value
      }
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.label
      }
      isDisabled={isEditingDisabled}
      onCreateOption={onCreateOption}
      menuPosition="fixed"
      createOptionPosition="first"
      formatCreateLabel={(value) => value}
      value={cellValue}
      noOptionsMessage={() => null}
      isValidNewOption={() => true}
      placeholder=""
      tabSelectsValue={false}
      menuPlacement="auto"
      backspaceRemovesValue={false}
      onBlur={(event) => {
        const inputValue = event.target.value;
        if (
          inputValue?.length &&
          (!cellValue?.length || !(cellValue as string[]).includes(inputValue))
        ) {
          onCreateOption(inputValue);
        }
      }}
      onChange={onChange}
      styles={SELECT_STYLES}
      classNames={{
        container: () => styles.container,
        control: (state) =>
          cn(
            styles.control,
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
        menu: () => styles.menu,
        menuPortal: () => styles.menuPortal,
        indicatorsContainer: () => styles.indicatorsContainer,
        singleValue: () => styles.singleValue,
        valueContainer: () => styles.valueContainer,
      }}
    />
  );
};

function getSelectedValueOnChange(option: ColumnValue) {
  return option;
}

function parseSelectedValues(selectedValues: any[]) {
  return selectedValues;
}
