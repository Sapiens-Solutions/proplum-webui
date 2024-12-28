import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";

interface IconButtonProps {
  tooltipMessage: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  tooltipDelayDuration?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  tooltipMessage,
  icon,
  onClick,
  className = "",
  iconClassName = "",
  disabled = false,
  tooltipDelayDuration = 0,
}) => {
  const Icon = icon;
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={tooltipDelayDuration}>
        <TooltipTrigger>
          <div
            className={cn(
              "flex h-8 select-none items-center justify-center rounded-md p-1 ring-1 ring-black ring-opacity-5 transition-colors",
              !disabled &&
                "shadow-md active:translate-y-[1px] active:shadow-sm",
              className
            )}
            onClick={onClick}
          >
            <Icon className={cn("h-5 transition-[stroke]", iconClassName)} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
