import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDagObjectsMap,
  getDagString,
  parseDagString,
} from "@/utils/airflowDag";
import {
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  addEdge,
  useNodesState,
  useReactFlow,
  useKeyPress,
} from "@xyflow/react";
import { DagNodeType } from "../components/DagNode";
import { DagEdgeType } from "../components/DagEdge";
import { getDagObjects as apiGetDagObjects } from "@/api";
import { DagObject } from "@/types";
import { useDagEdgesState } from "./useDagEdgesState";
import { createErrorToast } from "@/utils/toast";
import { useDebouncedEffect } from "@/hooks/useDebouncedEffect";

export type DagObjectsMap = Record<string, DagObject | undefined>;

interface DagDataState {
  canShowLoader: boolean;
  isInitializingGraph: boolean;
  dagObjects: DagObject[] | null;
  dagObjectsMap: DagObjectsMap | null;
  currentDagString: string | null;
  dagError: string | undefined;
  dagWarning: string | undefined;
  usedObjectIdMap: Record<string, boolean | undefined>;
}

interface UseDagFlowProps {
  initialDagString: string;
  onSave?: (newValue: any) => void;
  onClose?: () => void;
}

interface UseDagFlowReturnType {
  nodes: DagNodeType[];
  edges: DagEdgeType[];
  isInitializingGraph: boolean;
  canShowLoader: boolean;
  dagObjects: DagObject[] | null;
  dagObjectsMap: DagObjectsMap | null;
  currentDagString: string | null;
  dagError?: string | undefined;
  dagWarning?: string | undefined;
  isFormattingGraph: boolean;
  usedObjectIdMap: Record<string, boolean | undefined>;
  onConnect: OnConnect;
  onNodesChange: OnNodesChange<DagNodeType>;
  onEdgesChange: OnEdgesChange<DagEdgeType>;
  onDagSave: () => void;
  formatGraph: () => void;
  setNodes: React.Dispatch<React.SetStateAction<DagNodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<DagEdgeType[]>>;
  updateUsedObjectIdMap: (objectId: string) => void;
  onCurrentDagStringSet: (dagString: string) => void;
}

export function useDagFlow({
  initialDagString,
  onSave,
  onClose,
}: UseDagFlowProps): UseDagFlowReturnType {
  const { getNode } = useReactFlow();

  const [dagDataState, setDagDataState] = useState<DagDataState>({
    canShowLoader: false,
    isInitializingGraph: true,
    dagObjects: null,
    dagObjectsMap: null,
    currentDagString: null,
    dagError: undefined,
    dagWarning: undefined,
    usedObjectIdMap: {},
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<DagNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useDagEdgesState<DagEdgeType>([]);

  // Get DAG objects from API
  useEffect(() => {
    const fetchDagObjects = async () => {
      const [dagObjects] = await apiGetDagObjects();
      const dagObjectsMap: DagObjectsMap = getDagObjectsMap(dagObjects);

      setDagDataState((prevState) => ({
        ...prevState,
        dagObjects,
        dagObjectsMap,
      }));
    };

    fetchDagObjects();
  }, []);

  // Parse DAG string and initialize graph when 'initialDagString' is changed
  useEffect(() => {
    if (!dagDataState.dagObjectsMap) return;

    const { nodes, edges } = parseDagString(
      initialDagString,
      dagDataState.dagObjectsMap
    );
    setNodes(nodes);
    setEdges(edges);

    setDagDataState((prevState) => ({
      ...prevState,
      currentDagString: initialDagString,
    }));

    // Update 'isInitializingGraph' after small time for smoother flow editor opening
    const timeoutId = setTimeout(
      () =>
        setDagDataState((prevState) => ({
          ...prevState,
          isInitializingGraph: false,
        })),
      1
    );
    return () => clearTimeout(timeoutId);
  }, [initialDagString, dagDataState.dagObjectsMap, setNodes, setEdges]);

  // Allow to show loader spinner only after some time to not display loader in cases when parsing of dag string was fast
  useEffect(() => {
    const timeoutId = setTimeout(
      () =>
        setDagDataState((prevState) => ({ ...prevState, canShowLoader: true })),
      200
    );

    return () => clearTimeout(timeoutId);
  }, []);

  // Update current dag string when nodes and edges are changed
  useDebouncedEffect(
    () => {
      const { dagString, usedObjectIdMap, error, warning } = getDagString(
        nodes,
        edges
      );
      setDagDataState((prevState) => ({
        ...prevState,
        currentDagString: dagString,
        dagError: error,
        dagWarning: warning,
        usedObjectIdMap,
      }));
    },
    [nodes, edges],
    // Delay is used here to not force getting dag string after smallest node movement
    500
  );

  const [isFormattingGraph, setIsFormattingGraph] = useState<boolean>(false);

  const formatGraph = useCallback(() => {
    if (!dagDataState.dagObjectsMap) return;

    setIsFormattingGraph(true);

    const { nodes, edges } = parseDagString(
      dagDataState.currentDagString ?? "",
      dagDataState.dagObjectsMap
    );

    // Check if parsing was successfull
    if (nodes.length) {
      setNodes(nodes);
      setEdges(edges);
    } else {
      createErrorToast(
        "Не удалось форматировать граф. Возможно, он содержит ошибки.",
        3000
      );
    }

    setTimeout(() => setIsFormattingGraph(false), 300);
  }, [
    dagDataState.currentDagString,
    dagDataState.dagObjectsMap,
    setEdges,
    setNodes,
  ]);

  const isFormatKeyPressed = useKeyPress(["f", "а"]);

  // Check if some key was pressed
  useEffect(() => {
    if (!isFormatKeyPressed) return;

    formatGraph();
  }, [isFormatKeyPressed, formatGraph]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      const sourceNode = getNode(params.source);
      const targetNode = getNode(params.target);

      // Check if source or target is inside group (parentId !== undefined)
      if (
        sourceNode?.parentId !== undefined ||
        targetNode?.parentId !== undefined
      ) {
        const nodeInGroupId =
          sourceNode?.parentId !== undefined ? sourceNode.id : targetNode?.id;
        createErrorToast(
          `Нельзя соединить объекты, так как объект "${nodeInGroupId}" находится внутри группы`,
          1500
        );
        return;
      }

      setEdges((eds) => addEdge({ ...params, type: "dag-edge" }, eds));
    },
    [setEdges, getNode]
  );

  const updateUsedObjectIdMap = useCallback((objectId: string) => {
    setDagDataState((prevState) => ({
      ...prevState,
      usedObjectIdMap: {
        ...prevState.usedObjectIdMap,
        [objectId]: true,
      },
    }));
  }, []);

  const onDagSave = useCallback(() => {
    onSave?.(dagDataState.currentDagString ?? "");
    onClose?.();
  }, [onSave, onClose, dagDataState.currentDagString]);

  const isDagStringManuallyChangedRef = useRef<boolean>(false);

  const onCurrentDagStringSet = useCallback((dagString: string) => {
    isDagStringManuallyChangedRef.current = true;
    setDagDataState((prevState) => ({
      ...prevState,
      currentDagString: dagString,
    }));
  }, []);

  // Calls graph format fucntion after DAG string was manually changed by user
  useEffect(() => {
    if (isDagStringManuallyChangedRef.current) {
      formatGraph();
      isDagStringManuallyChangedRef.current = false;
    }
  }, [formatGraph]);

  return {
    nodes,
    edges,
    dagObjects: dagDataState.dagObjects,
    dagObjectsMap: dagDataState.dagObjectsMap,
    isInitializingGraph: dagDataState.isInitializingGraph,
    canShowLoader: dagDataState.canShowLoader,
    currentDagString: dagDataState.currentDagString,
    dagError: dagDataState.dagError,
    dagWarning: dagDataState.dagWarning,
    isFormattingGraph,
    usedObjectIdMap: dagDataState.usedObjectIdMap,
    onConnect,
    onNodesChange,
    onEdgesChange,
    onDagSave,
    setNodes,
    setEdges,
    formatGraph,
    updateUsedObjectIdMap,
    onCurrentDagStringSet,
  };
}
