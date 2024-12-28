import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloseIconButtonProps {
  onClick?: () => void;
  containerClassName?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
}

export const CloseIconButton: React.FC<CloseIconButtonProps> = ({
  onClick,
  containerClassName,
  iconClassName,
  style,
}) => {
  return (
    <button
      className={cn(
        "group rounded-[50%] bg-white p-[2px] transition-colors duration-200 hover:bg-red-500",
        containerClassName
      )}
      style={style}
      onClick={onClick}
    >
      <X
        className={cn(
          "block h-2 w-2 cursor-pointer rounded-[100%] stroke-[#171717] text-primary transition-[stroke] duration-200 group-hover:stroke-[#fff]",
          iconClassName
        )}
      />
    </button>
  );
};
