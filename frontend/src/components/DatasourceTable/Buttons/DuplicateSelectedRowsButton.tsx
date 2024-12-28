import React from "react";
import { CopyPlus } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { DatasourceTableMeta } from "../TablesInfo/TablesInfo";
import { IconButton } from "@/components/IconButton/IconButton";
import { useTableStore } from "@/store/tableStore";

interface DuplicateSelectedRowsButtonProps {
  table: Table<any>;
}

export const DuplicateSelectedRowsButton: React.FC<
  DuplicateSelectedRowsButtonProps
> = ({ table }) => {
  const isEditingTable = (table.options.meta as DatasourceTableMeta).isEditing;
  const canDuplicate =
    isEditingTable && table.getFilteredSelectedRowModel().rows.length;

  const addRows = useTableStore((state) => state.addRows);

  const onDuplicate = () => {
    addRows(
      table.getSelectedRowModel().rows.map((row) => ({
        // Make deep copy of duplicated row
        row: JSON.parse(JSON.stringify(row.original)),
        parentRowIndex: row.index,
      })),
      false,
      () => table.setRowSelection({})
    );
  };

  return (
    <IconButton
      tooltipMessage="Дублировать выделенные строки"
      icon={CopyPlus}
      onClick={canDuplicate ? onDuplicate : () => {}}
      disabled={!canDuplicate}
      className={
        canDuplicate
          ? "cursor-pointer bg-accentblue text-white hover:bg-accentblue/80"
          : "cursor-not-allowed bg-gray-50 text-gray-400"
      }
    />
  );
};
