import { ColumnSort, SortDirection } from "@tanstack/react-table";
import React from "react";
import { X } from "lucide-react";
import { BadgeButton } from "@/components/BadgeButton/BadgeButton";

interface ColumnSortingBadgeProps {
  sorting: ColumnSort;
  onSortSet: (columnName: string, value: SortDirection | false) => void;
  columnNameToLabel: Record<string, string>;
}

export const ColumnSortingBadge: React.FC<ColumnSortingBadgeProps> = ({
  sorting,
  onSortSet,
  columnNameToLabel,
}) => {
  const sortingValue = sorting.desc ? "DESC" : "ASC";

  return (
    <BadgeButton
      preLabelContent={<div className="mr-1 font-bold">{sortingValue}</div>}
      label={columnNameToLabel[sorting.id] ?? sorting.id}
      className="cursor-default bg-[#0052ac] text-white hover:bg-[#0052ac] hover:text-white"
      hasButtonWrapper={false}
      icon={X}
      iconColor="#171717"
      iconClassName="bg-white p-[2px] cursor-pointer"
      onIconClick={() => onSortSet(sorting.id, false)}
    />
  );
};
