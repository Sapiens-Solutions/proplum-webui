import React from "react";
import { X } from "lucide-react";
import { BadgeButton } from "@/components/BadgeButton/BadgeButton";

interface ClearAllBadgeProps {
  onFiltersClear: () => void;
}

export const ClearAllBadge: React.FC<ClearAllBadgeProps> = ({
  onFiltersClear,
}) => {
  return (
    <BadgeButton
      label="Очистить настройки"
      onButtonClick={onFiltersClear}
      icon={X}
      iconColor="#fff"
      iconClassName="bg-[#707f8d] p-[2px]"
    />
  );
};
