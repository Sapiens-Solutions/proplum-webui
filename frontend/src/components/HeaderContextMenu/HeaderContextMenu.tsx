import React, { useCallback, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { EllipsisVertical, Pin, PinOff } from "lucide-react";
import { Column } from "@tanstack/react-table";
import { DatasourceTableProps } from "../DatasourceTable/DatasourceTable";

interface HeaderContextMenuProps {
  column: Column<any, any>;
  iconClassName?: string;
  onColumnPin?: DatasourceTableProps["onColumnPin"];
}

export const HeaderContextMenu: React.FC<HeaderContextMenuProps> = ({
  column,
  iconClassName,
  onColumnPin,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onPopoverOpenChange = useCallback((open: boolean) => {
    setIsPopoverOpen(open);
  }, []);

  const handleColumnPin = useCallback(() => {
    setIsPopoverOpen(false);

    const isPinned = column.getIsPinned() === "left";

    // Pin or unpin column depending on current state
    onColumnPin?.(column.id, !isPinned);
  }, [column, onColumnPin]);

  const isPinned = column.getIsPinned() === "left";

  return (
    <Popover open={isPopoverOpen} onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 whitespace-nowrap !px-1 !shadow-none data-[state=open]:bg-accent"
        >
          <EllipsisVertical className={iconClassName} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="z-10 w-[190px] min-w-fit !p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-3 !p-0">
          <Button
            variant="ghost"
            size="sm"
            className="flex h-8 justify-start whitespace-nowrap !px-1 !py-5 !font-medium !shadow-none data-[state=open]:bg-accent"
            onClick={handleColumnPin}
          >
            <div className="pl-[4px]">
              {isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </div>
            <div className="ml-[8px]">
              {isPinned ? "Открепить колонку" : "Прикрепить колонку"}
            </div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
