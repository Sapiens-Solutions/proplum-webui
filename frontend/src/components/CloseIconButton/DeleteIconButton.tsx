import React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteIconButtonProps {
  onClick?: () => void;
  containerClassName?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
}

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({
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
      <Trash2
        className={cn(
          "block h-2 w-2 cursor-pointer rounded-[100%] stroke-[#171717] text-primary transition-[stroke] duration-200 group-hover:stroke-[#fff]",
          iconClassName
        )}
      />
    </button>
  );
};
