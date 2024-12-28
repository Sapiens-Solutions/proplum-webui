import React, { useRef, useState } from "react";
import Select, {
  components,
  CSSObjectWithLabel,
  GroupBase,
  SingleValue as SingleValueType,
  OptionProps,
  SelectInstance,
  SingleValueProps,
  StylesConfig,
  ActionMeta,
  ClassNamesConfig,
  MenuPosition,
} from "react-select";
import { ColumnValue, useTableStore } from "@/store/tableStore";
import selectStyles from "./Select.module.css";
import { cn } from "@/lib/utils";
import { TEN_SECONDS_MS } from "@/utils/time";

const CONTROL_STYLES: CSSObjectWithLabel = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "42px",
  outline: "0 !important",
  position: "relative",
  boxSizing: "border-box",
};

const SINGLE_VALUE_STYLES: CSSObjectWithLabel = {
  gridArea: "1/1/2/3",
  maxWidth: "100%",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginLeft: "2px",
  marginRight: "2px",
  boxSizing: "border-box",
};

const SELECT_STYLES: StylesConfig<
  ColumnValue,
  boolean,
  GroupBase<ColumnValue>
> = {
  // Change initial styles from "@emotion" library that are used by "react-select"
  control: (props) => ({ ...props, ...CONTROL_STYLES }),
  singleValue: () => SINGLE_VALUE_STYLES,
  // 10 + 1 to be above table headers
  menuPortal: (props) => ({ ...props, zIndex: 11 }),
};

export type SelectFromColumnValuesProps = {
  columnName: string;
  referredTableName: string;
  referredValueColumnName: string;
  referredDescriptionColumnName?: string;
  value: ColumnValue | null;
  onChange: (
    newValue: SingleValueType<ColumnValue> | null,
    actionMeta: ActionMeta<ColumnValue>
  ) => void;
  disabled?: boolean;
  selectClassNames?: ClassNamesConfig<
    ColumnValue,
    boolean,
    GroupBase<ColumnValue>
  >;
  styles?: StylesConfig<ColumnValue, boolean, GroupBase<ColumnValue>>;
  menuPosition?: MenuPosition;
  placeholder?: string;
  tabIndex?: number;
};

export const SelectFromColumnValues: React.FC<SelectFromColumnValuesProps> = ({
  columnName,
  referredTableName,
  referredValueColumnName,
  referredDescriptionColumnName,
  value,
  onChange,
  disabled = false,
  selectClassNames = {
    container: () => selectStyles.container,
    control: () => cn(selectStyles.control),
    menu: () => selectStyles.menu,
    indicatorsContainer: () => selectStyles.indicatorsContainer,
    singleValue: () => selectStyles.singleValue,
  },
  styles = SELECT_STYLES,
  menuPosition = "fixed",
  placeholder = "",
  tabIndex,
}) => {
  const getColumnValues = useTableStore((state) => state.getColumnValues);

  const [options, setOptions] = useState<ColumnValue[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);

  const selectRef = useRef<SelectInstance<any> | null>(null);
  const lastFetchTimestamp = useRef<number | undefined>();

  const loadOptionsIfNeeded = () => {
    if (
      lastFetchTimestamp.current &&
      Date.now() < lastFetchTimestamp.current + TEN_SECONDS_MS
    )
      return;

    setIsLoadingOptions(true);
    getColumnValues(
      columnName,
      referredTableName,
      referredValueColumnName,
      referredDescriptionColumnName
    )
      .then((options) => {
        setOptions(options);
        lastFetchTimestamp.current = Date.now();
        if (selectRef.current) {
          // Reopen menu to recalculate it's height depending on options amount
          selectRef.current.onMenuClose();
          selectRef.current.openMenu("first");
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingOptions(false);
      });
  };

  return (
    <Select
      isMulti={false}
      // @ts-ignore
      ref={selectRef}
      options={options}
      components={{ Option, SingleValue }}
      tabIndex={tabIndex}
      // @ts-ignore
      onChange={onChange}
      value={typeof value === "object" ? value : { value: value ?? "" }}
      isDisabled={disabled}
      placeholder={placeholder}
      isLoading={isLoadingOptions}
      loadingMessage={LoadOptionsMessage}
      onFocus={loadOptionsIfNeeded}
      noOptionsMessage={NoOptionsMessage}
      menuPosition={menuPosition}
      classNamePrefix="react-select"
      styles={styles}
      openMenuOnFocus
      tabSelectsValue={false}
      menuPlacement="auto"
      classNames={selectClassNames}
    />
  );
};

function NoOptionsMessage() {
  return "Нет опций";
}

function LoadOptionsMessage() {
  return "Загрузка значений...";
}

function SingleValue({ data, ...props }: SingleValueProps<ColumnValue>) {
  return (
    <components.SingleValue data={data} {...props}>
      {data.value}
    </components.SingleValue>
  );
}

function Option({ data, ...props }: OptionProps<ColumnValue>) {
  return (
    <components.Option data={data} {...props}>
      <div>
        <div>{data.value}</div>
        {data.description ? (
          <div className="whitespace-pre-wrap text-[12px]">
            {data.description}
          </div>
        ) : null}
      </div>
    </components.Option>
  );
}
