import { DagGraph } from "@/components/DagEditor/types";
import { DagNodeType } from "@/components/DagEditor/components/DagNode";
import { DagEdgeType } from "@/components/DagEditor/components/DagEdge";
import { DagObject } from "@/types";
import { getTextWidth } from "./text";
import { DagObjectsMap } from "@/components/DagEditor/hooks/useDagFlow";
import {
  ObjectNodeType,
  ObjectNodeTypeData,
} from "@/components/DagEditor/components/ObjectNode";
import { GroupNodeType } from "@/components/DagEditor/components/GroupNode";

const EDGE_STRING = ">>";

const GROUP_START_CHAR = "[";
const GROUP_END_CHAR = "]";
const GROUP_ID_SEPARATOR = ",";

const GROUP_X_OFFSET = 70;
const GROUP_INNER_Y_OFFSET = 80;

const NODE_BORDER_RADIUS = "5px";

const GROUP_X_PADDING = 32;
const GROUP_Y_PADDING = 16;

const NODE_X_PADDING = 26;

const MIN_NODE_WIDTH = 65;
const MIN_NODE_HEIGHT = 65;

// Parses string dag and returns nodes, edges and groups of nodes
export function parseDagString(
  dagString: string,
  dagObjectsMap: DagObjectsMap
): DagGraph {
  if (!dagString) {
    return { nodes: [], edges: [] };
  }

  const groupNodes: GroupNodeType[] = [];
  const objectNodes: ObjectNodeType[] = [];
  const dagEdges: DagEdgeType[] = [];

  // 1) Split by EDGE_STRING
  const splittedNodeGroups = dagString.split(EDGE_STRING);

  // 2) Find groups and single nodes
  let previousMainNode: DagNodeType | null = null;
  let currentXOffset: number = 0;
  splittedNodeGroups.forEach((groupString, groupIndex) => {
    const {
      objectNodes: currentObjectNodes,
      groupNode,
      mainNode,
      groupWidth,
    } = parseNodesGroup(groupString, groupIndex, dagObjectsMap, currentXOffset);

    if (groupNode) {
      groupNodes.push(groupNode);
    }
    objectNodes.push(...currentObjectNodes);

    if (previousMainNode && mainNode) {
      // Create edge between main node of previous group and main node of current group
      dagEdges.push(createDagEdge(previousMainNode.id, mainNode.id));
    }

    // Update current X offset
    currentXOffset += groupWidth + GROUP_X_OFFSET;

    previousMainNode = mainNode;
  });

  // Group nodes should be behind object nodes
  const dagNodes: DagNodeType[] = [...groupNodes, ...objectNodes];

  return { nodes: dagNodes, edges: dagEdges };
}

// Parses group of DAG nodes or single node: "[1,2,3,4]" => [1, 2, 3, 4] OR "1" => [1]
// If it's a group of nodes, last returned node is node for group
export function parseNodesGroup(
  groupString: string,
  groupIndex: number,
  dagObjectsMap: DagObjectsMap,
  groupXOffset: number
): {
  objectNodes: ObjectNodeType[];
  groupNode?: GroupNodeType | null;
  mainNode: DagNodeType | null;
  groupWidth: number;
} {
  if (!groupString) return { objectNodes: [], mainNode: null, groupWidth: 0 };

  let isGroup: boolean;
  let nodeStrings: string[];
  if (groupString[0] === GROUP_START_CHAR) {
    if (groupString[1] === GROUP_END_CHAR) {
      // Found empty group, skip it
      return { objectNodes: [], mainNode: null, groupWidth: 0 };
    }

    // Remove group symbols
    groupString = groupString.substring(1, groupString.length - 1);

    // Found group
    isGroup = true;
    nodeStrings = groupString.split(GROUP_ID_SEPARATOR);
  } else {
    // Found single node
    isGroup = false;
    nodeStrings = [groupString];
  }

  // Check if need to make group node
  let groupNode: DagNodeType | null = null;
  let groupId: string | undefined = undefined;
  if (isGroup) {
    // Create group node
    groupId = `___group-${groupIndex}-${Date.now()}`;
    groupNode = createGroupNode({
      x: groupXOffset,
      y: 0,
      width: 100,
      height: nodeStrings.length * GROUP_INNER_Y_OFFSET + GROUP_Y_PADDING,
      id: groupId,
      data: {},
    });
  }

  // Find object nodes
  const objectNodes: ObjectNodeType[] = [];
  let maxGroupNodeWidth: number = 0;
  nodeStrings.forEach((nodeIdString, nodeIndex) => {
    const { node: newNode, nodeWidth } = calculateAndCreateObjectNode({
      nodeIdString,
      groupXOffset,
      nodeIndex,
      dagObjectsMap,
      groupId,
      isInGroup: isGroup,
    });

    if (nodeWidth > maxGroupNodeWidth) {
      maxGroupNodeWidth = nodeWidth;
    }

    objectNodes.push(newNode);
  });

  // Adjust group width to node with max width
  let groupWidth: number;
  if (isGroup && groupNode) {
    groupWidth = Math.max(maxGroupNodeWidth + 2 * GROUP_X_PADDING, 150);
    groupNode.style!.width = groupWidth;
  } else {
    groupWidth = maxGroupNodeWidth;
  }

  // Adjust nodes position in group relatively to group width
  if (isGroup) {
    for (let i = 0; i < objectNodes.length; i++) {
      const node = objectNodes[i];
      const nodeWidth = Number(node.style?.width) || 0;
      node.position.x += (groupWidth - 2 * GROUP_X_PADDING - nodeWidth) / 2;
    }
  }

  // Main node is group node or single node (if it exists outside of group)
  const mainNode =
    groupNode ?? (objectNodes.length > 0 ? objectNodes[0] : null);

  return {
    objectNodes,
    groupNode,
    mainNode,
    groupWidth,
  };
}

export function calculateAndCreateObjectNode({
  nodeIdString,
  groupXOffset,
  nodeIndex,
  dagObjectsMap,
  groupId,
  isInGroup = false,
  x,
  y,
}: {
  nodeIdString: string;
  groupXOffset: number;
  nodeIndex: number;
  dagObjectsMap: DagObjectsMap;
  groupId?: string;
  isInGroup?: boolean;
  x?: number;
  y?: number;
}): { node: ObjectNodeType; nodeWidth: number } {
  // Find correlating DAG object
  const dagObject: DagObject = dagObjectsMap[nodeIdString] ?? {
    id: nodeIdString,
  };

  // If node is in group, its x and y position are calculated relatively to parent node
  const xOffset =
    x !== undefined ? x : isInGroup ? GROUP_X_PADDING : groupXOffset;
  const yOffset =
    y !== undefined
      ? y
      : isInGroup
        ? nodeIndex * GROUP_INNER_Y_OFFSET + GROUP_Y_PADDING
        : nodeIndex * GROUP_INNER_Y_OFFSET;

  // Calculate node width
  const idStr = dagObject.id.toString();
  const nameStr = dagObject.name ?? "";

  const idLength = idStr.length;
  const nameLength = nameStr.length;
  const nodeLongestText: string = nameLength > idLength ? nameStr : idStr;

  const nodeWidth = Math.max(
    getTextWidth(nodeLongestText.toString()) + 2 * NODE_X_PADDING,
    MIN_NODE_WIDTH
  );

  // Create node
  const nodeData: ObjectNodeTypeData = {
    objectId: nodeIdString,
    name: dagObject.name,
    description: dagObject.description,
  };
  const node = createObjectNode({
    x: xOffset,
    y: yOffset,
    id: `${nodeIdString}-${Date.now()}`,
    data: nodeData,
    parentId: groupId,
    width: nodeWidth,
  });

  return { node, nodeWidth };
}

export function createObjectNode({
  x,
  y,
  width = MIN_NODE_WIDTH,
  height = MIN_NODE_HEIGHT,
  id,
  data,
  parentId,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  id: string;
  data: ObjectNodeTypeData;
  parentId?: string;
  backgroundColor?: string;
}): ObjectNodeType {
  return {
    id,
    type: "object",
    data,
    position: { x, y },
    className: "light",
    style: {
      width,
      height,
      borderRadius: NODE_BORDER_RADIUS,
    },
    parentId,
  };
}

export function createGroupNode({
  x,
  y,
  width,
  height,
  id,
  data,
  backgroundColor = "rgba(100, 149, 237, 0.2)",
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  data: Record<string, any>;
  backgroundColor?: string;
}): GroupNodeType {
  return {
    id,
    data,
    type: "group",
    position: { x, y },
    className: "light",
    style: { backgroundColor, width, height, borderRadius: NODE_BORDER_RADIUS },
  };
}

export function createDagEdge(
  startNodeId: string,
  endNodeId: string,
  animated = true
): DagEdgeType {
  return {
    id: `e${startNodeId}-${endNodeId}`,
    type: "dag-edge",
    source: startNodeId,
    target: endNodeId,
    animated,
  };
}

export function getDagObjectsMap(dagObjects: DagObject[]): DagObjectsMap {
  const dagObjectMap: DagObjectsMap = {};

  dagObjects.forEach((object) => {
    dagObjectMap[object.id] = object;
  });

  return dagObjectMap;
}

export function getDagString(
  nodes: DagNodeType[],
  edges: DagEdgeType[]
): {
  dagString: string;
  usedObjectIdMap: Record<string, true>;
  error?: string;
  warning?: string;
} {
  if (!nodes?.length && !edges?.length)
    return { dagString: "", usedObjectIdMap: {}, error: undefined };

  // 1) Create map that shows connections between nodes.
  // Also check if some node has 2 or more incoming/outcoming edges.
  const nodeIdToConnectedNodeIdMap: Record<string, string> = {};
  const targetedNodesMap: Record<string, true> = {};
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const source = edge.source;
    const target = edge.target;

    if (nodeIdToConnectedNodeIdMap[source]) {
      // Found node that has 2 or more outcoming edges
      return {
        dagString: "",
        usedObjectIdMap: getUsedObjectIdMap(nodes),
        error: "одна из вершин идёт по двум или более путям",
      };
    }

    if (targetedNodesMap[target]) {
      // Found node that has 2 or more incoming edges
      return {
        dagString: "",
        usedObjectIdMap: getUsedObjectIdMap(nodes),
        error: "к одной из вершин ведут два или более путей",
      };
    }

    nodeIdToConnectedNodeIdMap[source] = target;
    targetedNodesMap[target] = true;
  }

  // 2) Find nodes that don't have incoming edges and are not inside group.
  // Check that there's only one such node.
  // Also make map (groupId)-> (array of nodes inside this group).
  let startNodeId: string | null = null;
  const groupToNodesMap: Record<string, string[]> = {};
  const nodeIdToNode: Record<string, DagNodeType> = {};
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeId = node.id;
    nodeIdToNode[nodeId] = node;

    const parentId = node.parentId;

    if (parentId) {
      // Node is inside group
      if (!groupToNodesMap[parentId]) {
        groupToNodesMap[parentId] = [];
      }

      groupToNodesMap[parentId].push(nodeId);

      continue;
    }

    if (targetedNodesMap[nodeId]) {
      // Node has incoming edge
      continue;
    }

    if (startNodeId) {
      // Found 2 or more starting nodes
      return {
        dagString: "",
        usedObjectIdMap: getUsedObjectIdMap(nodes),
        error:
          "найдено две или более стартовых вершин (в них не ведёт ни одна из других вершин)",
      };
    }

    startNodeId = nodeId;
  }

  if (!startNodeId) {
    // Couldn't find starting node
    return {
      dagString: "",
      usedObjectIdMap: getUsedObjectIdMap(nodes),
      error:
        "не удалось найти стартовую вершину (отсутствуют вершины, в которые не ведёт ни одна из других вершин)",
    };
  }

  // Sort group arrays by Y coordinate.
  Object.keys(groupToNodesMap).forEach((groupId) => {
    groupToNodesMap[groupId].sort((node1Id: string, node2Id: string) => {
      const node1 = nodeIdToNode[node1Id];
      const node2 = nodeIdToNode[node2Id];

      return node1.position.y - node2.position.y;
    });
  });

  // 3) Make path by going from starting node to end node (node that doesn't have any outcoming edges).
  const nodeIdsPath: string[] = [];
  let currentNodeId: string | null = startNodeId;
  while (currentNodeId) {
    nodeIdsPath.push(currentNodeId);
    currentNodeId = nodeIdToConnectedNodeIdMap[currentNodeId];
  }

  // 4) Create DAG string with path array. Check if some object IDs are encountered 2 or more times
  const encounteredObjectIdMap: Record<string, true> = {};
  const multipleTimesEncounteredObjectIdMap: Record<string, true> = {};
  let hasEmptyGroup: boolean = false;
  const dagString: string = nodeIdsPath
    .map((nodeId) => {
      const node = nodeIdToNode[nodeId];

      if (!node?.type) return "";

      if (node.type === "object") {
        const objectId = node.data.objectId.toString();

        fillEncounteredObjectIdsInfo(
          objectId,
          encounteredObjectIdMap,
          multipleTimesEncounteredObjectIdMap
        );

        return objectId;
      }

      if (node.type === "group") {
        const nodeIdsInGroup = groupToNodesMap[nodeId];
        if (!nodeIdsInGroup) {
          hasEmptyGroup = true;
          return "[]";
        }

        const objectIds: string[] = [];
        for (let j = 0; j < nodeIdsInGroup.length; j++) {
          const nodeId = nodeIdsInGroup[j];
          const node = nodeIdToNode[nodeId];

          if (!node || node.type !== "object") {
            continue;
          }

          const objectId = node.data.objectId.toString();
          objectIds.push(objectId);

          fillEncounteredObjectIdsInfo(
            objectId,
            encounteredObjectIdMap,
            multipleTimesEncounteredObjectIdMap
          );
        }

        const objectIdsString = objectIds.join(GROUP_ID_SEPARATOR);

        // Make group string
        return `${GROUP_START_CHAR}${objectIdsString}${GROUP_END_CHAR}`;
      }

      return "";
    })
    .join(EDGE_STRING);

  let warning: string | undefined = undefined;
  const multipleObjectIdsWarning = getMultipleTimesEncounteredObjectIdsWarning(
    multipleTimesEncounteredObjectIdMap
  );
  if (multipleObjectIdsWarning) {
    warning = multipleObjectIdsWarning;
  } else if (hasEmptyGroup) {
    warning = "Предупреждение: в пути присутствует пустая группа";
  }

  return {
    dagString,
    usedObjectIdMap: encounteredObjectIdMap,
    error: undefined,
    warning,
  };
}

function fillEncounteredObjectIdsInfo(
  objectId: string,
  encounteredObjectIdMap: Record<string, true>,
  multipleTimesEncounteredObjectIdMap: Record<string, true>
) {
  if (encounteredObjectIdMap[objectId]) {
    multipleTimesEncounteredObjectIdMap[objectId] = true;
  } else {
    encounteredObjectIdMap[objectId] = true;
  }
}

function getMultipleTimesEncounteredObjectIdsWarning(
  multipleTimesEncounteredObjectIdMap: Record<string, true>
): string | undefined {
  if (!multipleTimesEncounteredObjectIdMap) return undefined;

  const objectIds = Object.keys(multipleTimesEncounteredObjectIdMap);
  if (!objectIds.length) return undefined;

  return `Предупреждение, следующие объекты используются в графе два или более раз: ${objectIds.map((id) => `'${id}'`).join(", ")}`;
}

function getUsedObjectIdMap(nodes: DagNodeType[]): Record<string, true> {
  if (!nodes?.length) return {};

  const usedObjectIdMap: Record<string, true> = {};
  nodes.forEach((node) => {
    if (node.type === "object") {
      usedObjectIdMap[node.data.objectId] = true;
    }
  });

  return usedObjectIdMap;
}
