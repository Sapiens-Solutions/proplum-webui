import { cn } from "@/lib/utils";
import { CircleCheckBig, OctagonX } from "lucide-react";
import React from "react";
import { useCellData } from "./hooks/useCellData";
import { BaseCellProps } from "./types";

export const BooleanCell: React.FC<BaseCellProps> = ({
  columnName,
  row,
  disabled = false,
  onUpdateCell,
  isAddedRow = false,
}) => {
  const { cellValue, isCellEdited, isEditingDisabled, onChange } = useCellData({
    columnName,
    row,
    disabled,
    onUpdateCell,
    isAddedRow,
    onChangeGetValue: () => !cellValue,
    parseInputValue: parseBooleanInputValue,
  });

  const isUndefined = cellValue === undefined;

  return (
    <button
      className={cn(
        "flex h-8 w-[80px] cursor-default select-none items-center justify-center whitespace-nowrap rounded-[6px] border border-transparent px-[8px] py-[0px] text-xs font-medium transition-[background-color,color] focus:outline-none focus:ring-0 focus-visible:ring-2",
        isUndefined
          ? "bg-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-400"
          : cellValue
            ? "bg-[#d0f9e4] text-[#00593f] hover:bg-[#d0f9e4] hover:text-[#00593f]"
            : "bg-[#fde1e1] text-[#ac4141] hover:bg-[#fde1e1] hover:text-[#ac4141]",
        isCellEdited &&
          !isAddedRow &&
          "bg-[#fef6d8] hover:bg-[#fdf0bf] focus:bg-[#fdf0bf]",
        !isEditingDisabled && "cursor-pointer"
      )}
      onClick={isEditingDisabled ? () => {} : onChange}
    >
      {cellValue === undefined ? (
        <>UNDEFINED</>
      ) : cellValue ? (
        <>
          <CircleCheckBig
            color="#00593f"
            className="mr-2 block h-4 w-4 rounded-[100%] p-0 text-primary"
          />
          <div>TRUE</div>
        </>
      ) : (
        <>
          <OctagonX
            color="#ac4141"
            className="mr-2 block h-4 w-4 rounded-[100%] p-0 text-primary"
          />
          <div>FALSE</div>
        </>
      )}
    </button>
  );
};

function parseBooleanInputValue(value: boolean) {
  return value;
}
