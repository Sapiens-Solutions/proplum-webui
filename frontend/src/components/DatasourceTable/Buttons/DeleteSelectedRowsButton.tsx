import React, { useState } from "react";
import { useTableStore } from "@/store/tableStore";
import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DatasourceTableMeta } from "../TablesInfo/TablesInfo";
import { IconButton } from "@/components/IconButton/IconButton";
import { Alert } from "@/components/Alert/Alert";

interface DeleteSelectedRowsButtonProps {
  table: Table<any>;
}

export const DeleteSelectedRowsButton: React.FC<
  DeleteSelectedRowsButtonProps
> = ({ table }) => {
  const deleteRows = useTableStore((state) => state.deleteRows);

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const isEditingTable = (table.options.meta as DatasourceTableMeta).isEditing;
  const canDelete =
    isEditingTable && table.getFilteredSelectedRowModel().rows.length;

  const onDeleteRows = () => {
    setIsAlertOpen(false);
    deleteRows(
      table
        .getSelectedRowModel()
        .rows.map((row) => ({ data: row.original, tableIndexId: row.id })),
      () => table.setRowSelection({})
    );
  };

  return (
    <div>
      <IconButton
        tooltipMessage="Удалить выделенные строки"
        icon={Trash2}
        onClick={
          canDelete ? () => setIsAlertOpen((prevValue) => !prevValue) : () => {}
        }
        disabled={!canDelete}
        className={
          canDelete
            ? "cursor-pointer bg-[#d23232] text-white hover:bg-[#d23232]/80"
            : "cursor-not-allowed bg-gray-50 text-gray-400"
        }
      />
      <Alert
        isOpen={isAlertOpen}
        title="Вы уверены?"
        description="Удаление строк необратимо."
        cancelLabel="Отменить"
        confirmLabel="Удалить"
        onCancel={() => setIsAlertOpen(false)}
        onConfirm={onDeleteRows}
      />
    </div>
  );
};
