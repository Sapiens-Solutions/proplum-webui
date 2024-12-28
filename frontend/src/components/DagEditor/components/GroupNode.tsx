import {
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
  NodeResizeControl,
} from "@xyflow/react";
import { memo, useCallback } from "react";
import { handleNodeDelete } from "../utils";
import { NodeDeleteButton } from "./NodeDeleteButton";
import { CustomHandle } from "./CustomHandle";

const controlStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  zIndex: 2,
};

export type GroupNodeTypeData = { title?: string };
export type GroupNodeStringType = "group";
export type GroupNodeType = Node<GroupNodeTypeData, GroupNodeStringType>;

export const GroupNode: React.FC<NodeProps<GroupNodeType>> = memo(
  ({ id, positionAbsoluteX, positionAbsoluteY }) => {
    const { setNodes, updateNode, setEdges } = useReactFlow();

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
        <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
          <div className="absolute bottom-[-2px] right-[-2px] z-[2] h-[8px] w-[8px] bg-blue-500" />
        </NodeResizeControl>

        <CustomHandle type="target" position={Position.Left} />

        <div />
        <NodeDeleteButton onNodeDelete={onNodeDelete} />

        <CustomHandle type="source" position={Position.Right} />
      </>
    );
  }
);
