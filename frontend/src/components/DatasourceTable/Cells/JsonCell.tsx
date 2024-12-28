import {
  JSON_VIEWER_HEIGHT,
  JSON_VIEWER_WIDTH,
  JsonViewer,
} from "@/components/JsonViewer/JsonViewer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableStore } from "@/store/tableStore";
import React, { useCallback } from "react";
import { useCellData } from "./hooks/useCellData";
import cellStyles from "./Cells.module.css";
import { cn } from "@/lib/utils";
import { getBlockPositionForScreenCenter } from "@/utils/common";
import { BaseCellProps } from "./types";

export const JsonCell: React.FC<BaseCellProps> = ({
  columnName,
  row,
  disabled,
  onUpdateCell,
  isAddedRow,
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
    onChangeGetValue: (value) => value,
    parseInputValue: (value) => value,
  });

  const addJsonModal = useTableStore((state) => state.addJsonModal);

  const onOpenJsonModal = useCallback(
    (event: { clientX: number; clientY: number }) => {
      // Open near click position
      addJsonModal({
        content: JsonViewer,
        contentProps: { value: cellValue, onSave: onChange },
        startPosition: {
          x: event.clientX - JSON_VIEWER_WIDTH / 2,
          y: event.clientY - 40,
        },
      });
    },
    [addJsonModal, cellValue, onChange]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.code === "Enter") {
        const { x, y } = getBlockPositionForScreenCenter(
          JSON_VIEWER_WIDTH,
          JSON_VIEWER_HEIGHT
        );
        onOpenJsonModal({
          // Open in center of window
          clientX: x,
          clientY: y,
        });
      }
    },
    [onOpenJsonModal]
  );

  return (
    <div className="flex items-center" onKeyDown={onKeyDown}>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger className="m-0 p-0 outline-blue-300 !ring-0 focus-visible:!outline-2 focus-visible:!ring-0 focus-visible:!ring-ring focus-visible:!ring-offset-0">
            <div
              className={cn(
                "max-w-[250px] overflow-hidden text-ellipsis rounded-[4px] bg-gray-200 px-[6px] py-[4px] hover:opacity-80",
                isEditingDisabled && cellStyles.disabledCell,
                !isAddedRow && isCellEdited && cellStyles.editedCellInput,
                wasRecentlySaved && cellStyles.savedCellInput
              )}
              onClick={onOpenJsonModal}
            >
              {cellValue ? JSON.stringify(cellValue) : "null"}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="end" alignOffset={120}>
            <div className="whitespace-pre">
              {cellValue ? JSON.stringify(cellValue, null, 4) : "Пустой JSON"}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
