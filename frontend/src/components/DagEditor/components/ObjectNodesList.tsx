import { DagObject } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SidebarObjectNode } from "./SidebarObjectNode";
import { ViewportList } from "react-viewport-list";

const listStyles: React.CSSProperties = {
  height: "calc(95vh - 360px)",
  overflow: "auto",
};

interface ObjectNodesList {
  dagObjects: DagObject[] | null;
  usedObjectIdMap: Record<string, boolean | undefined>;
}

export const ObjectNodesList: React.FC<ObjectNodesList> = ({
  dagObjects,
  usedObjectIdMap,
}) => {
  const [search, setSearch] = useState<string>("");
  const [filteredDagObjects, setFilteredDagObjects] = useState<DagObject[]>([]);

  useEffect(() => {
    if (!dagObjects?.length) {
      setFilteredDagObjects([]);
      return;
    }

    if (!search) {
      setFilteredDagObjects(dagObjects ?? []);
      return;
    }

    // Filter through objects list
    const filteredDagObjects: DagObject[] = [];
    const searchLowerCased: string = search.toLowerCase();
    dagObjects.forEach((object) => {
      if (
        object.id.toString().toLowerCase().includes(searchLowerCased) ||
        object.name?.toString().toLowerCase().includes(searchLowerCased) ||
        object.description?.toString().toLowerCase().includes(searchLowerCased)
      ) {
        filteredDagObjects.push(object);
      }
    });

    setFilteredDagObjects(filteredDagObjects);
  }, [search, dagObjects]);

  const listRef = useRef(null);

  const [hoveredDagObject, setHoveredDagObject] = useState<{
    dagObjectName?: string;
    dagObjectDescription?: string;
  } | null>(null);

  // Callback for passing 'setHoveredDagObject' as unchangeabe function to children
  const onHoveredDagObjectChange = useCallback<
    React.Dispatch<
      React.SetStateAction<{
        dagObjectName?: string | undefined;
        dagObjectDescription?: string | undefined;
      } | null>
    >
  >((state) => setHoveredDagObject(state), []);

  return (
    <div className="relative">
      <h3 className="mt-[4px] px-[16px] py-[8px] font-medium">Объекты</h3>
      <div className="px-[16px] pb-[8px] pt-[0]">
        <input
          className="w-full border-b border-b-gray-300 px-[0px] py-[4px] !outline-none"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Поиск..."
        />
      </div>

      <div className="scroll-container" ref={listRef} style={listStyles}>
        <ViewportList
          viewportRef={listRef}
          items={filteredDagObjects}
          itemSize={40}
        >
          {(object) => (
            <SidebarObjectNode
              key={`${object.id}-${object?.name}`}
              dagObject={object}
              setHoveredDagObject={onHoveredDagObjectChange}
              isInGraph={!!usedObjectIdMap[object.id]}
            />
          )}
        </ViewportList>
      </div>

      {hoveredDagObject ? (
        <div className="absolute bottom-0 left-[-320px] top-[150px] my-0 flex h-[300px] w-[300px] items-center justify-end">
          <div className="rounded-[4px] border bg-white px-[16px] py-[8px]">
            {hoveredDagObject.dagObjectName ? (
              <div className="font-medium">
                {hoveredDagObject.dagObjectName}
              </div>
            ) : null}
            {hoveredDagObject.dagObjectDescription ? (
              <div>{hoveredDagObject.dagObjectDescription}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
