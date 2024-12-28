import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { applyEdgeChanges, type Edge, type OnEdgesChange } from "@xyflow/react";

/**
 * Hook for managing the state of edges.
 *
 * @public
 * @param initialEdges
 * @returns an array [edges, setEdges, onEdgesChange]
 */
export function useDagEdgesState<EdgeType extends Edge = Edge>(
  initialEdges: EdgeType[]
): [EdgeType[], Dispatch<SetStateAction<EdgeType[]>>, OnEdgesChange<EdgeType>] {
  const [edges, setEdges] = useState(initialEdges);
  const onEdgesChange: OnEdgesChange<EdgeType> = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  return [edges, setEdges, onEdgesChange];
}
