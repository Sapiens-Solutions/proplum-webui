import { DagNodeType } from "./components/DagNode";
import { DagEdgeType } from "./components/DagEdge";

export type DagGraph = { nodes: DagNodeType[]; edges: DagEdgeType[] };
