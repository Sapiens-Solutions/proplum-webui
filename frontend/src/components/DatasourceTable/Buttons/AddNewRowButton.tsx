import React, { useCallback } from "react";
import { SquarePlus } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { DatasourceTableMeta } from "../TablesInfo/TablesInfo";
import { useTableStore } from "@/store/tableStore";
import { IconButton } from "@/components/IconButton/IconButton";

interface AddNewRowButtonProps {
  table: Table<any>;
}

export const AddNewRowButton: React.FC<AddNewRowButtonProps> = ({ table }) => {
  const addRows = useTableStore((state) => state.addRows);

  const onAddRow = useCallback(() => addRows([{}], true), [addRows]);

  const isEditing = (table.options.meta as DatasourceTableMeta).isEditing;

  return (
    <IconButton
      tooltipMessage="Добавить строку"
      icon={SquarePlus}
      onClick={isEditing ? onAddRow : () => {}}
      disabled={!isEditing}
      className={
        isEditing
          ? "cursor-pointer bg-accentblue text-white hover:bg-accentblue/80"
          : "cursor-not-allowed bg-gray-50 text-gray-400"
      }
    />
  );
};
