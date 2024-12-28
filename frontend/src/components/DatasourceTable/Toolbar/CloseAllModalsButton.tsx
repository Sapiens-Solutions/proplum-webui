import { Badge } from "@/components/ui/badge";
import { useTableStore } from "@/store/tableStore";
import { X } from "lucide-react";
import React from "react";

export const CloseAllModalsButton: React.FC = () => {
  const modals = useTableStore((state) => state.modals);
  const shouldHideCloseModalsButton = useTableStore(
    (state) => state.shouldHideCloseModalsButton
  );
  const triggerModalsClose = useTableStore((state) => state.triggerModalsClose);

  return !shouldHideCloseModalsButton && modals?.length ? (
    <Badge
      onClick={triggerModalsClose}
      className="h-8 cursor-pointer whitespace-nowrap rounded-[6px] bg-[#f2f5f9] px-[12px] py-[15px] font-medium text-primary transition-colors duration-200 hover:bg-[#e2e7ec]"
    >
      Закрыть все окна
      <X
        color="#fff"
        className="ml-2 block h-4 w-4 cursor-pointer rounded-[100%] bg-[#707f8d] p-[2px] text-primary transition-opacity duration-200 hover:opacity-60"
      />
    </Badge>
  ) : null;
};
