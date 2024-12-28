import React from "react";
import styles from "./DagSidebar.module.css";
import { SidebarGroupNode } from "./SidebarGroupNode";
import { ObjectNodesList } from "./ObjectNodesList";
import { DagObject } from "@/types";
import { Separator } from "@/components/ui/separator";

interface DagSidebarProps {
  dagObjects: DagObject[] | null;
  usedObjectIdMap: Record<string, boolean | undefined>;
}

export const DagSidebar: React.FC<DagSidebarProps> = ({
  dagObjects,
  usedObjectIdMap,
}) => {
  return (
    <aside className={styles.dagDndSidebar}>
      <SidebarGroupNode />
      <Separator orientation="horizontal" />
      <ObjectNodesList
        dagObjects={dagObjects}
        usedObjectIdMap={usedObjectIdMap}
      />
    </aside>
  );
};
