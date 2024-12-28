import { Column, SortDirection } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDown } from "lucide-react";
import styles from "./DatasourceTableColumnHeader.module.css";
import { useCallback } from "react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { HeaderContextMenu } from "../HeaderContextMenu/HeaderContextMenu";
import { DatasourceTableProps } from "./DatasourceTable";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  canSort?: boolean;
  canFilter?: boolean;
  comment?: string | null;
  onColumnPin?: DatasourceTableProps["onColumnPin"];
  isContextMenuVisible?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  canSort = true,
  className = "",
  comment,
  onColumnPin,
  isContextMenuVisible = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sortDirection: false | SortDirection = column.getIsSorted();

  const onSortClick = useCallback(() => {
    column.toggleSorting(sortDirection === "asc");
  }, [column, sortDirection]);

  const SortIconComponent =
    sortDirection === "desc"
      ? ArrowDownIcon
      : sortDirection === "asc"
        ? ArrowUpIcon
        : ArrowUpDown;

  return (
    <div className="relative">
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <div className="flex items-center">
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(className, !canSort && "pointer-events-none")}
                onClick={onSortClick}
              >
                <span>{title}</span>
                {sortDirection ? (
                  <SortIconComponent
                    className={cn(styles.headerIcon, "ml-1")}
                  />
                ) : null}
              </Button>
            </TooltipTrigger>
            {isContextMenuVisible ? (
              <HeaderContextMenu
                column={column}
                iconClassName={styles.headerIcon}
                onColumnPin={onColumnPin}
              />
            ) : null}
          </div>
          <TooltipContent
            side="top"
            align="center"
            className={!comment ? "hidden" : ""}
          >
            <div className="whitespace-pre">
              {comment ?? "Нет комментариев"}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
