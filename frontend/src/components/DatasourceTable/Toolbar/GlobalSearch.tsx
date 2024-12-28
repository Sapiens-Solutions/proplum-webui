import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import styles from "./GlobalSearch.module.css";
import { useDebounce } from "@/hooks/useDebounce";

const GLOBAL_FILTER_DEBOUNCE_DELAY_MS = 250;

interface GlobalSearchProps {
  globalFilterValue: string;
  onGlobalFilterSet: (globalFilter: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  globalFilterValue,
  onGlobalFilterSet,
}) => {
  const [searchInputValue, setSearchInputValue] = useState<string>("");

  useEffect(() => {
    setSearchInputValue(globalFilterValue);
  }, [globalFilterValue]);

  const debouncedGlobalFilterSet = useDebounce(
    onGlobalFilterSet,
    GLOBAL_FILTER_DEBOUNCE_DELAY_MS
  );

  const onSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchValue = event.target.value;

      setSearchInputValue(newSearchValue);
      debouncedGlobalFilterSet(newSearchValue);
    },
    [debouncedGlobalFilterSet]
  );

  return (
    <div className={styles.globalSearchInputContainer}>
      <Input
        name="global_rows_search"
        placeholder="Глобальный поиск..."
        value={searchInputValue}
        onChange={onSearchChange}
        className={styles.searchInput}
        spellCheck={false}
      />
      <div className="absolute bottom-0 right-0 top-0 my-auto w-[28px] border-l px-[6px]">
        <Search className="h-full w-full" />
      </div>
    </div>
  );
};
