import { ObjectNodeStringType, ObjectNodeType } from "./ObjectNode";
import { GroupNodeStringType, GroupNodeType } from "./GroupNode";

export type DagNodeStringType = ObjectNodeStringType | GroupNodeStringType;
export type DagNodeType = ObjectNodeType | GroupNodeType;
