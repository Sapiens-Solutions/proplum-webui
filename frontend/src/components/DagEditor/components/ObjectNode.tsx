import { memo, useCallback } from "react";
import {
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
  NodeToolbar,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { handleNodeDelete } from "../utils";
import { useHovered } from "../hooks/useHovered";
import { CustomHandle } from "./CustomHandle";
import { NodeDeleteButton } from "./NodeDeleteButton";

export type ObjectNodeTypeData = {
  objectId: string | number;
  name?: string;
  description?: string;
};
export type ObjectNodeStringType = "object";
export type ObjectNodeType = Node<ObjectNodeTypeData, ObjectNodeStringType>;

export const ObjectNode: React.FC<NodeProps<ObjectNodeType>> = memo(
  ({ id, data, parentId, positionAbsoluteX, positionAbsoluteY }) => {
    const { setNodes, updateNode, setEdges } = useReactFlow();

    // Have to use custom hook for detecting when node is hovered and tooltip should be visible
    const { isHovered, onMouseEnter, onMouseLeave } = useHovered();

    const hasHandles = !parentId;

    const onNodeDelete = useCallback(() => {
      handleNodeDelete({
        id,
        positionAbsoluteX,
        positionAbsoluteY,
        setNodes,
        updateNode,
        setEdges,
      });
    }, [
      id,
      positionAbsoluteX,
      positionAbsoluteY,
      setNodes,
      updateNode,
      setEdges,
    ]);

    return (
      <>
        <CustomHandle
          type="target"
          position={Position.Left}
          className={!hasHandles ? "!pointer-events-none opacity-0" : undefined}
        />

        {data.description ? (
          <NodeToolbar isVisible={isHovered} position={Position.Top}>
            <div className="rounded-[6px] bg-white px-[6px] py-[4px] text-center text-[12px]">
              {data.description}
            </div>
          </NodeToolbar>
        ) : null}

        <div
          className={cn(
            "flex h-full flex-col justify-center rounded-[6px] text-center text-[16px] font-normal text-white",
            parentId ? "bg-[#3a75c4]" : "bg-[#7854aa]"
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div>{data.objectId}</div>
          {data.name ? <div className="mt-[3px]">{data.name}</div> : null}
        </div>
        <NodeDeleteButton onNodeDelete={onNodeDelete} />

        <CustomHandle
          type="source"
          position={Position.Right}
          className={!hasHandles ? "!pointer-events-none opacity-0" : undefined}
        />
      </>
    );
  }
);
