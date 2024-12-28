import React from "react";
import { useTableStore } from "@/store/tableStore";
import { DraggableResizableModal } from "../DraggableResizableModal/DraggableResizableModal";

export const ModalsContainer: React.FC = () => {
  const modals = useTableStore((state) => state.modals);

  return (
    <div className="absolute left-0 top-0 z-[1000]">
      {modals.map((modal) => (
        <DraggableResizableModal
          key={modal.id}
          id={modal.id}
          label={modal.label}
          initialLeftOffset={modal.startPosition.x}
          initialTopOffset={modal.startPosition.y}
          content={modal.content}
          contentProps={modal.contentProps}
        />
      ))}
    </div>
  );
};
