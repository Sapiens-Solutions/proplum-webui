import React from "react";
import { ColumnFilter } from "@tanstack/react-table";
import { X } from "lucide-react";
import { EXACT_FILTER_START_SYMBOL } from "../TablesInfo/utils";
import { BadgeButton } from "@/components/BadgeButton/BadgeButton";

interface ColumnFilterBadgeProps {
  filter: ColumnFilter;
  onFilterSet: (columnName: string, value: string | number) => void;
  columnNameToLabel: Record<string, string>;
}

export const ColumnFilterBadge: React.FC<ColumnFilterBadgeProps> = ({
  filter,
  onFilterSet,
  columnNameToLabel,
}) => {
  const strFilterValue = filter.value as string;
  const isExactFilter = strFilterValue.startsWith(EXACT_FILTER_START_SYMBOL);
  const filterValue = isExactFilter
    ? strFilterValue.substring(1)
    : strFilterValue;

  return (
    <BadgeButton
      label={`${columnNameToLabel[filter.id] ?? filter.id}${isExactFilter ? " =" : ":"} ${filterValue}`}
      className="cursor-default bg-[#0052ac] text-white hover:bg-[#0052ac] hover:text-white"
      hasButtonWrapper={false}
      icon={X}
      iconColor="#171717"
      iconClassName="bg-white p-[2px] cursor-pointer"
      onIconClick={() => onFilterSet(filter.id, "")}
    />
  );
};
