import React from "react";
import { Badge } from "../ui/badge";
import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeButtonProps {
  label: string;
  className?: string;
  onButtonClick?: () => void;
  preLabelContent?: React.ReactNode;
  icon?: React.FC<LucideProps>;
  iconColor?: string;
  iconClassName?: string;
  onIconClick?: () => void;
  hasButtonWrapper?: boolean;
}

export const BadgeButton: React.FC<BadgeButtonProps> = ({
  label,
  className = "",
  onButtonClick,
  preLabelContent,
  icon,
  iconColor = "#707f8d",
  iconClassName = "",
  onIconClick,
  hasButtonWrapper = true,
}) => {
  const Icon = icon;

  const innerPart = (
    <Badge
      onClick={hasButtonWrapper ? undefined : onButtonClick}
      className={cn(
        "h-8 cursor-pointer whitespace-nowrap rounded-md bg-[#f2f5f9] px-[12px] py-[15px] font-medium text-primary shadow-sm ring-1 ring-black ring-opacity-5 transition-colors duration-200 hover:bg-[#e2e7ec]",
        className
      )}
    >
      {preLabelContent ?? null}
      <span>{label}</span>
      {Icon ? (
        <Icon
          onClick={onIconClick}
          color={iconColor}
          className={cn(
            "ml-2 block h-4 w-4 cursor-pointer rounded-[100%] p-0 text-primary transition-opacity duration-200 hover:opacity-60",
            iconClassName
          )}
        />
      ) : null}
    </Badge>
  );

  return hasButtonWrapper ? (
    <button onClick={onButtonClick}>{innerPart}</button>
  ) : (
    innerPart
  );
};
