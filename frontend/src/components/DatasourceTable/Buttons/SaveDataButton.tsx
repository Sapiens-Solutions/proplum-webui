import React, { useMemo } from "react";
import { Save } from "lucide-react";
import { useTableStore } from "@/store/tableStore";
import { IconButton } from "@/components/IconButton/IconButton";

export const SaveDataButton: React.FC = () => {
  const editedRows = useTableStore((state) => state.editedRows);
  const addedRows = useTableStore((state) => state.addedRows);
  const saveEditedData = useTableStore((state) => state.saveEditedData);

  const canSave = useMemo<boolean>(
    () =>
      Object.keys(editedRows).length > 0 || Object.keys(addedRows).length > 0,
    [editedRows, addedRows]
  );

  return (
    <IconButton
      tooltipMessage="Сохранить изменения"
      icon={Save}
      onClick={canSave ? saveEditedData : () => {}}
      disabled={!canSave}
      className={
        canSave
          ? "cursor-pointer bg-green-500 text-white hover:bg-green-500/80"
          : "cursor-not-allowed bg-gray-50 text-gray-400"
      }
    />
  );
};
