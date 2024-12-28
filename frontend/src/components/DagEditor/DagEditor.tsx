import React, { ReactNode } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  type NodeTypes,
  type DefaultEdgeOptions,
  EdgeTypes,
  ReactFlowProvider,
  ControlButton,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDagFlow } from "./hooks/useDagFlow";
import { Button } from "../ui/button";
import { Loader } from "../Loader/Loader";
import DagEdge from "./components/DagEdge";
import { ObjectNode } from "./components/ObjectNode";
import { GroupNode } from "./components/GroupNode";
import styles from "./DagEditor.module.css";
import { cn } from "@/lib/utils";
import { DagSidebar } from "./components/DagSidebar";
import { DnDProvider } from "./contexts/DnDContext";
import { useDragDrop } from "./hooks/useDragDrop";
import { Separator } from "../ui/separator";
import { Wrench } from "lucide-react";
import { EditDagStringButton } from "./components/EditDagStringButton";

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const nodeTypes: NodeTypes = { object: ObjectNode, group: GroupNode };

const edgeTypes: EdgeTypes = {
  "dag-edge": DagEdge,
};

interface DagEditorProps {
  initialDagString: string;
  graphContainerClassName?: string;
  onSave: (newValue: any) => void;
  onClose: () => void;
  headerClassName?: string;
  footerContainer?: React.FC<{
    children: ReactNode | ReactNode[];
    className?: string;
  }>;
  footerContainerClassName?: string;
}

const DagEditorInner: React.FC<DagEditorProps> = ({
  initialDagString,
  graphContainerClassName = "",
  onSave,
  onClose,
  headerClassName = "",
  footerContainer,
  footerContainerClassName = "",
}) => {
  const {
    isInitializingGraph,
    canShowLoader,
    nodes,
    edges,
    dagObjects,
    currentDagString,
    dagError,
    dagWarning,
    isFormattingGraph,
    usedObjectIdMap,
    onConnect,
    onEdgesChange,
    onNodesChange,
    onDagSave,
    formatGraph,
    updateUsedObjectIdMap,
    onCurrentDagStringSet,
  } = useDagFlow({
    initialDagString,
    onSave,
    onClose,
  });

  const { onDragOver, onDrop, onNodeDragStart, onNodeDrag, onNodeDragStop } =
    useDragDrop({ updateUsedObjectIdMap });

  const FooterContainer = footerContainer;

  return (
    <>
      <div
        className={cn(
          "min-h-[40px] break-all text-sm text-muted-foreground",
          headerClassName
        )}
      >
        {dagError ? (
          `Ошибка построения пути: ${dagError}`
        ) : (
          <>
            <div>{currentDagString}</div>
            {dagWarning ? <div>{dagWarning}</div> : null}
          </>
        )}
      </div>
      <div className={styles.dndflow}>
        <div className={cn(graphContainerClassName, styles.reactflowWrapper)}>
          {isInitializingGraph ? (
            canShowLoader ? (
              <Loader
                color="#fff"
                secondaryColor="#0f4c85"
                wrapperClassName="h-full"
                containerClassName="w-[20vh] h-[20vh] border-[5px]"
              />
            ) : (
              <div />
            )
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              defaultEdgeOptions={defaultEdgeOptions}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onNodeDragStart={onNodeDragStart}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
            >
              <Controls>
                <ControlButton
                  title="Форматировать DAG (клавиша F)"
                  onClick={formatGraph}
                  disabled={isFormattingGraph}
                  className="disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Wrench />
                </ControlButton>
              </Controls>
              <Background />
            </ReactFlow>
          )}
        </div>
        <Separator orientation="vertical" />
        <DagSidebar dagObjects={dagObjects} usedObjectIdMap={usedObjectIdMap} />
      </div>
      {FooterContainer ? (
        <FooterContainer className={footerContainerClassName}>
          <Button onClick={onClose} variant="outline">
            Отменить
          </Button>
          <EditDagStringButton
            initialValue={currentDagString ?? ""}
            onDagStringEdit={onCurrentDagStringSet}
          />
          <Button onClick={onDagSave}>Сохранить</Button>
        </FooterContainer>
      ) : null}
    </>
  );
};

// Wrapper for DAG editor with react flow provider
export const DagEditor: React.FC<DagEditorProps> = ({
  initialDagString,
  graphContainerClassName = "",
  onSave,
  onClose,
  headerClassName = "",
  footerContainer,
  footerContainerClassName = "",
}) => {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DagEditorInner
          initialDagString={initialDagString}
          graphContainerClassName={graphContainerClassName}
          onSave={onSave}
          onClose={onClose}
          headerClassName={headerClassName}
          footerContainer={footerContainer}
          footerContainerClassName={footerContainerClassName}
        />
      </DnDProvider>
    </ReactFlowProvider>
  );
};
