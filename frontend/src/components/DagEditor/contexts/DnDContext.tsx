import { ReactNode, createContext, useState } from "react";
import { DagNodeStringType } from "../components/DagNode";
import { DagObject } from "@/types";

export type DragData = {
  type: DagNodeStringType | null;
  dagObject?: DagObject;
};

export type DnDContextData = {
  dragData: DragData;
  setDragData: React.Dispatch<React.SetStateAction<DragData>>;
};

const DnDContext = createContext<DnDContextData>({
  dragData: {
    type: null,
    dagObject: undefined,
  },
  setDragData: () => {},
});

interface DnDProviderProps {
  children: ReactNode | ReactNode[];
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
  const [dragData, setDragData] = useState<DragData>({
    type: null,
    dagObject: undefined,
  });

  return (
    <DnDContext.Provider value={{ dragData, setDragData }}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;
