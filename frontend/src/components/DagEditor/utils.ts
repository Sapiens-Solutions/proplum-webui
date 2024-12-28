import { type Node, type Edge } from "@xyflow/react";
import { DagNodeType } from "./components/DagNode";
import { DagEdgeType } from "./components/DagEdge";

// Deletes node with specified id
export function handleNodeDelete({
  id,
  positionAbsoluteX,
  positionAbsoluteY,
  setNodes,
  updateNode,
  setEdges,
}: {
  id: string;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  setNodes: (payload: Node[] | ((nodes: Node[]) => Node[])) => void;
  updateNode: (
    id: string,
    nodeUpdate: Partial<Node> | ((node: Node) => Partial<Node>),
    options?:
      | {
          replace: boolean;
        }
      | undefined
  ) => void;
  setEdges: (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void;
}) {
  // 1) Remove current node and update parentId prop for other nodes
  setNodes((nodes) => {
    const newNodes: DagNodeType[] = [];

    (nodes as DagNodeType[]).forEach((node: DagNodeType) => {
      // Found current node, skip it
      if (node.id === id) return;

      // Found children node, update parentId prop
      if (node.parentId === id) {
        updateNode(node.id, (node) => ({
          parentId: undefined,
          position: {
            x: node.position.x + positionAbsoluteX,
            y: node.position.y + positionAbsoluteY,
          },
        }));
      }

      newNodes.push(node);
    });

    return newNodes;
  });

  // 2) Delete edges of current node
  removeNodeEdges(id, setEdges);
}

// Removes all edges that are connected to specified node
export function removeNodeEdges(
  nodeId: string,
  setEdges: (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void
) {
  setEdges((edges) => {
    const newEdges: DagEdgeType[] = [];

    (edges as DagEdgeType[]).forEach((edge) => {
      // Found edge that uses current node, skip it
      if (edge.source === nodeId || edge.target === nodeId) return;

      newEdges.push(edge);
    });

    return newEdges;
  });
}
