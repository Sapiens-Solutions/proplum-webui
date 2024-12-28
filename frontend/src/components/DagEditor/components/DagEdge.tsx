import { CloseIconButton } from "@/components/CloseIconButton/CloseIconButton";
import {
  BaseEdge,
  type EdgeProps,
  type Edge,
  Position,
  getSimpleBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";

export type DagEdgeTypeData = { value?: number };

export type DagEdgeType = Edge<DagEdgeTypeData, "dag-edge">;

export default function DagEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps<DagEdgeType>) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Left,
    targetX,
    targetY,
    targetPosition: Position.Right,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <CloseIconButton
          containerClassName="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== id));
          }}
        />
      </EdgeLabelRenderer>
    </>
  );
}
