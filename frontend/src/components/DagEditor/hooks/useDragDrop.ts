import { OnNodeDrag, Rect, useReactFlow } from "@xyflow/react";
import { useDnD } from "./useDnD";
import { DagNodeType } from "../components/DagNode";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  calculateAndCreateObjectNode,
  createGroupNode,
} from "@/utils/airflowDag";
import { GroupNodeType } from "../components/GroupNode";
import { removeNodeEdges } from "../utils";

interface UseDragDropProps {
  updateUsedObjectIdMap: (objectId: string) => void;
}

export function useDragDrop({ updateUsedObjectIdMap }: UseDragDropProps) {
  const { dragData } = useDnD();

  const {
    screenToFlowPosition,
    getIntersectingNodes,
    setNodes,
    setEdges,
    updateNode,
    getNode,
    getInternalNode,
  } = useReactFlow();

  const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  const onDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();

      // Check if the dropped element is valid
      if (!dragData?.type) {
        return;
      }

      const dragNodeType = dragData.type;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: DagNodeType | null = null;
      let shouldInsertToStart: boolean = false;
      if (dragNodeType === "object" && dragData.dagObject) {
        // Object node was dropped
        const dagObject = dragData.dagObject;
        const dagObjectStringId = dagObject.id.toString();

        // Create object node
        const newNodeInfo = calculateAndCreateObjectNode({
          nodeIdString: dagObjectStringId,
          groupXOffset: 0,
          nodeIndex: 0,
          dagObjectsMap: { [dagObjectStringId]: dagObject },
          groupId: undefined,
          isInGroup: false,
          x: position.x,
          y: position.y,
        });
        newNode = newNodeInfo.node;

        // Check if object node was dropped into group
        const nodeRect: Rect = {
          x: newNode.position.x,
          y: newNode.position.y,
          width: newNode.measured?.width ?? 100,
          height: newNode.measured?.height ?? 20,
        };
        const intersectingNodes = getIntersectingNodes(nodeRect);

        // Find first intersecting group node if there is any
        let groupNode: GroupNodeType | undefined = undefined;
        for (let i = 0; i < intersectingNodes.length; i++) {
          const node = intersectingNodes[i] as DagNodeType;
          if (node.type === "group" && node.id) {
            groupNode = node;
          }
        }

        if (groupNode) {
          newNode.parentId = groupNode.id;

          // Also recalculate node position relatively to new parent
          newNode.position.x = newNode.position.x - groupNode.position.x;
          newNode.position.y = newNode.position.y - groupNode.position.y;
        }

        updateUsedObjectIdMap(dagObjectStringId);
      } else if (dragNodeType === "group") {
        // Group node was dropped
        const groupId = `___group-new-${Date.now()}`;
        newNode = createGroupNode({
          x: position.x,
          y: position.y,
          width: 153,
          height: 150,
          id: groupId,
          data: {},
        });
        shouldInsertToStart = true;
      }

      if (newNode === null) return;

      if (shouldInsertToStart) {
        setNodes((nds) => [newNode].concat(nds as DagNodeType[]));
      } else {
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [
      screenToFlowPosition,
      setNodes,
      updateUsedObjectIdMap,
      getIntersectingNodes,
      dragData,
    ]
  );

  const currentDraggedNodeRef = useRef<DagNodeType | null>(null);
  const draggedNodeInitialParentIdRef = useRef<string | undefined>(undefined);
  const draggedNodeUpdatedParentIdRef = useRef<string | undefined>(undefined);

  // target is the node that the node is dragged over
  const [currentGroupUnderDraggedNode, setCurrentGroupUnderDraggedNode] =
    useState<GroupNodeType | null>(null);

  const onNodeDragStart = useCallback<OnNodeDrag<DagNodeType>>((_, node) => {
    // Set node that we are currently dragging
    currentDraggedNodeRef.current = node;
    draggedNodeInitialParentIdRef.current = node.parentId;
    draggedNodeUpdatedParentIdRef.current = node.parentId;
  }, []);

  const onNodeDragStop = useCallback<OnNodeDrag<DagNodeType>>(() => {
    setCurrentGroupUnderDraggedNode(null);

    const draggedNode = currentDraggedNodeRef.current;
    const initialParentId = draggedNodeInitialParentIdRef.current;
    const updatedParentId = draggedNodeUpdatedParentIdRef.current;
    if (
      draggedNode?.type === "object" &&
      initialParentId === undefined &&
      updatedParentId !== undefined
    ) {
      // If object node out of group was added to group, remove edges with that node
      removeNodeEdges(draggedNode.id, setEdges);
    }

    currentDraggedNodeRef.current = null;
    draggedNodeInitialParentIdRef.current = undefined;
    draggedNodeUpdatedParentIdRef.current = undefined;
  }, [setEdges]);

  // Finds underlying group nodes when dragging object node
  const onNodeDrag = useCallback<OnNodeDrag<DagNodeType>>(
    (_, node) => {
      if (node.type !== "object") return;

      // Find overlapping nodes
      const intersectingNodes = getIntersectingNodes(node);

      // Find group node
      const groupNode: GroupNodeType | null = intersectingNodes?.find(
        (node) => node.type === "group"
      ) as GroupNodeType | null;

      setCurrentGroupUnderDraggedNode(groupNode);
    },
    [getIntersectingNodes]
  );

  // Updates object node parentId when there is group under it while dragging
  // or else sets parentId to undefined
  useEffect(() => {
    const draggedNode = currentDraggedNodeRef.current;
    if (!draggedNode?.id) return;

    const internal = getInternalNode(draggedNode.id);
    const absolutePosition = internal?.internals.positionAbsolute ?? {
      x: 0,
      y: 0,
    };

    // Recalculate node position relatively to parent or no parent
    let newX: number = draggedNode.position.x;
    let newY: number = draggedNode.position.y;
    if (currentGroupUnderDraggedNode?.id) {
      // Now node has parent => recalculate position relatively to new parent
      newX = absolutePosition.x - currentGroupUnderDraggedNode.position.x;
      newY = absolutePosition.y - currentGroupUnderDraggedNode.position.y;
    } else {
      // Now node doesn't have parent => recalculate position relatively to absolute coords
      newX = absolutePosition.x;
      newY = absolutePosition.y;
    }

    draggedNodeUpdatedParentIdRef.current = currentGroupUnderDraggedNode?.id;

    updateNode(draggedNode.id, (node) => ({
      ...node,
      parentId: currentGroupUnderDraggedNode?.id,
      position: { x: newX, y: newY },
    }));
  }, [currentGroupUnderDraggedNode, getInternalNode, updateNode, getNode]);

  return {
    onDragOver,
    onDrop,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
}
