import { cn } from "@/lib/utils";
import React, { useCallback } from "react";
import styles from "./DagSidebar.module.css";
import { DagObject } from "@/types";
import { useDnD } from "../hooks/useDnD";
import { CircleCheck, GripVertical } from "lucide-react";

interface SidebarObjectNodeProps {
  dagObject: DagObject;
  setHoveredDagObject: React.Dispatch<
    React.SetStateAction<{
      dagObjectName?: string | undefined;
      dagObjectDescription?: string | undefined;
    } | null>
  >;
  isInGraph: boolean;
}

export const SidebarObjectNode: React.FC<SidebarObjectNodeProps> = ({
  dagObject,
  setHoveredDagObject,
  isInGraph,
}) => {
  const { setDragData } = useDnD();

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      setHoveredDagObject(null);
      setDragData({
        type: "object",
        dagObject,
      });
      event.dataTransfer.effectAllowed = "move";
    },
    [dagObject, setDragData, setHoveredDagObject]
  );

  return (
    <div
      className={cn(
        styles.dndnode,
        "overflow-hidden text-ellipsis whitespace-nowrap",
        isInGraph && "cursor-not-allowed hover:bg-inherit"
      )}
      onDragStart={onDragStart}
      onMouseEnter={() => {
        setHoveredDagObject({
          dagObjectName: dagObject.name,
          dagObjectDescription: dagObject.description,
        });
      }}
      onMouseLeave={() => {
        setHoveredDagObject(null);
      }}
      draggable={!isInGraph}
    >
      <div className="flex max-w-[190px] items-center overflow-hidden text-ellipsis">
        <div className="font-medium">{dagObject.id}</div>
        {dagObject.name ? (
          <div className="ml-[4px] overflow-hidden text-ellipsis">
            {dagObject.name}
          </div>
        ) : null}
      </div>
      {isInGraph ? (
        <div
          title="Объект добавлен в граф"
          className="ml-auto block h-[18px] w-[18px]"
        >
          <CircleCheck className="block h-[18px] w-[18px] stroke-green-500" />
        </div>
      ) : (
        <GripVertical className="ml-auto block h-[18px] w-[18px]" />
      )}
    </div>
  );
};
