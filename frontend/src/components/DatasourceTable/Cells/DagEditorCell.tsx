import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BaseCellProps } from "./types";
import { useCellData } from "./hooks/useCellData";
import cellStyles from "./Cells.module.css";
import { ModalDagEditor } from "@/components/ModalDagEditor/ModalDagEditor";

export const DagEditorCell: React.FC<BaseCellProps> = ({
  columnName,
  row,
  disabled,
  onUpdateCell,
  isAddedRow,
}) => {
  const {
    cellValue,
    isCellEdited,
    wasRecentlySaved,
    isEditingDisabled,
    onChange,
  } = useCellData({
    columnName,
    row,
    disabled,
    onUpdateCell,
    isAddedRow,
    onChangeGetValue: (value) => value,
    parseInputValue: (value) => value,
  });

  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);

  const onOpenEditorModal = useCallback(() => {
    setIsEditorModalOpen((prevState) => !prevState);
  }, []);

  const onCloseEditorModal = useCallback(() => {
    setIsEditorModalOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenEditorModal}
        className={cn(
          "min-w-[100px] justify-start rounded-[4px] bg-blue-100 px-[6px] py-[4px] text-start hover:bg-blue-200 hover:opacity-80 focus-visible:border-blue-400",
          isEditingDisabled && cellStyles.disabledCell,
          !isAddedRow && isCellEdited && cellStyles.editedCellInput,
          wasRecentlySaved && cellStyles.savedCellInput
        )}
      >
        {cellValue}
      </Button>
      {isEditorModalOpen ? (
        <ModalDagEditor
          initialDagString={cellValue ?? null}
          onSave={onChange}
          onClose={onCloseEditorModal}
          isOpen={isEditorModalOpen}
        />
      ) : null}
    </>
  );
};
