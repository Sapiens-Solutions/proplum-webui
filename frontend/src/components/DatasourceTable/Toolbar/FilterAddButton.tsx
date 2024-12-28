import React, { useCallback, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { DatasourceColumnDef } from "../TablesInfo/TablesInfo";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import styles from "./FilterAddButton.module.css";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { BadgeButton } from "@/components/BadgeButton/BadgeButton";

const FILTER_DEBOUNCE_DELAY_MS = 250;

interface FilterAddButtonProps {
  columns: DatasourceColumnDef[];
  onFilterSet: (columnName: string, value: string | number) => void;
  columnNameToLabel: Record<string, string>;
}

export const FilterAddButton: React.FC<FilterAddButtonProps> = ({
  columns,
  onFilterSet,
  columnNameToLabel,
}) => {
  const filterValueInputRef = useRef<HTMLInputElement>(null);

  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [selectedColumnName, setSelectedColumnName] = useState<
    string | undefined
  >(undefined);

  const [filterValue, setFilterValue] = useState<string | undefined>(undefined);

  const onFilterApply = useCallback(() => {
    if (selectedColumnName && filterValue) {
      onFilterSet(selectedColumnName, filterValue);
    }

    setIsFilterPopoverOpen(false);
    setSelectedColumnName(undefined);
    setFilterValue(undefined);
  }, [selectedColumnName, filterValue, onFilterSet]);

  const onFilterPopoverOpenChange = useCallback((open: boolean) => {
    setIsFilterPopoverOpen(open);
  }, []);

  const debouncedFilterSet = useDebounce(onFilterSet, FILTER_DEBOUNCE_DELAY_MS);

  const onFilterInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilterValue(event.target.value);

      // If column is selected also apply filter to see changes in rows immediately
      if (selectedColumnName) {
        debouncedFilterSet(selectedColumnName, event.target.value);
      }
    },
    [selectedColumnName, debouncedFilterSet]
  );

  const onFilterInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onFilterApply();
      }
    },
    [onFilterApply]
  );

  const columnsOptions = useMemo(
    () =>
      columns?.length
        ? columns.map((col) => ({
            value: col.accessorKey,
            label: columnNameToLabel[col.accessorKey],
          }))
        : [],
    [columns, columnNameToLabel]
  );

  return columns?.length ? (
    <Popover
      open={isFilterPopoverOpen}
      onOpenChange={onFilterPopoverOpenChange}
    >
      <PopoverTrigger asChild>
        <button className="!outline-none !ring-0">
          <BadgeButton
            label="Добавить фильтр"
            icon={CirclePlus}
            hasButtonWrapper={false}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="z-10"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-3 p-[10px]">
          <Select
            options={columnsOptions}
            placeholder="Выберите колонку..."
            noOptionsMessage={() => "Колонки не найдены"}
            openMenuOnFocus
            autoFocus
            menuPosition="absolute"
            styles={{}}
            classNames={{
              control: () =>
                "!border !border-input !shadow-none !bg-background !text-sm !rounded-[6px]",
            }}
            onChange={(newValue) => {
              setSelectedColumnName(newValue?.value ?? undefined);
              if (filterValueInputRef.current) {
                filterValueInputRef.current.focus();
              }
            }}
          />
          <Input
            value={filterValue ?? ""}
            onChange={onFilterInputChange}
            placeholder="Значение фильтра"
            className={styles.filterInput}
            ref={filterValueInputRef}
            onKeyDown={onFilterInputKeyDown}
          />
          <Button
            onClick={onFilterApply}
            disabled={!selectedColumnName || !filterValue}
            className="bg-[#0052ac] enabled:hover:bg-[#0052ac]/80 disabled:bg-[#0052ac]/50"
          >
            Применить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ) : null;
};
