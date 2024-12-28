import { DeleteIconButton } from "@/components/CloseIconButton/DeleteIconButton";
import React from "react";

interface NodeDeleteButtonProps {
  onNodeDelete: () => void;
}

export const NodeDeleteButton: React.FC<NodeDeleteButtonProps> = ({
  onNodeDelete,
}) => {
  return (
    <div className="pointer-events-auto">
      <DeleteIconButton
        containerClassName="nodrag nopan absolute top-[2px] right-[2px] pointer-events-auto z-[2]"
        onClick={onNodeDelete}
      />
    </div>
  );
};
