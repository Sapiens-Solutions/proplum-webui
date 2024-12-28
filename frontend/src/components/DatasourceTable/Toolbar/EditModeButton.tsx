import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SquarePen } from "lucide-react";

interface EditModeButtonProps {
  isTableEditable?: boolean;
  isEditing?: boolean;
  onEditModeSet?: (isEditing: boolean) => void;
}

export const EditModeButton: React.FC<EditModeButtonProps> = ({
  isTableEditable,
  isEditing,
  onEditModeSet,
}) => {
  return !isTableEditable || !onEditModeSet ? null : (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <div
            className={`flex h-8 cursor-pointer select-none items-center justify-center rounded-md p-2 transition-colors ${isEditing ? "bg-[#0052ac] text-white hover:bg-[#0052ac]/80" : "bg-[#f2f5f9] hover:bg-[#e2e7ec]"}`}
            onClick={() => onEditModeSet(!isEditing)}
          >
            <SquarePen
              color={isEditing ? "#fff" : "#71717A"}
              className="h-5 transition-[stroke]"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isEditing ? "Отключить редактирование" : "Включить редактирование"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
