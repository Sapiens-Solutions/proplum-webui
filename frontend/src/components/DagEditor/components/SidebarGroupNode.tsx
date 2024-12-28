import { cn } from "@/lib/utils";
import React, { useCallback } from "react";
import styles from "./DagSidebar.module.css";
import { useDnD } from "../hooks/useDnD";
import { GripVertical } from "lucide-react";

export const SidebarGroupNode: React.FC = () => {
  const { setDragData } = useDnD();

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      setDragData({
        type: "group",
        dagObject: undefined,
      });
      event.dataTransfer.effectAllowed = "move";
    },
    [setDragData]
  );

  return (
    <div
      className={cn(styles.dndnode, styles.dndnodeGroup)}
      onDragStart={onDragStart}
      draggable
    >
      <div>Группа</div>
      <GripVertical className="ml-auto block h-[18px] w-[18px]" />
    </div>
  );
};
