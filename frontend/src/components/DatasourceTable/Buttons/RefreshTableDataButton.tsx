import React, { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "@/components/IconButton/IconButton";
import { useTableStore } from "@/store/tableStore";

export const RefreshTableDataButton: React.FC = () => {
  const hasLoadedTableDataOnce = useTableStore(
    (state) => state.hasLoadedTableDataOnce
  );
  const isTableDataPending = useTableStore((state) => state.isTableDataPending);
  const refetchData = useTableStore((state) => state.refetchData);

  const [wasJustClicked, setWasJustClicked] = useState<boolean>(false);

  const onRefreshData = useCallback(() => {
    refetchData();
    setWasJustClicked(true);

    const timeoutId = setTimeout(() => setWasJustClicked(false), 200);
    return () => clearTimeout(timeoutId);
  }, [refetchData]);

  const canRefresh =
    hasLoadedTableDataOnce && !isTableDataPending && !wasJustClicked;
  const isRefreshing =
    wasJustClicked || (hasLoadedTableDataOnce && isTableDataPending);

  return (
    <IconButton
      tooltipMessage={
        isRefreshing ? "Обновляем данные..." : "Обновить данные таблицы"
      }
      icon={RefreshCw}
      onClick={canRefresh ? onRefreshData : () => {}}
      className={
        canRefresh
          ? "cursor-pointer bg-accentblue text-white hover:bg-accentblue/80"
          : "cursor-not-allowed bg-accentblue/50 text-white"
      }
      disabled={isRefreshing || !canRefresh}
    />
  );
};
