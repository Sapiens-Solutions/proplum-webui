import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DagEditor } from "../DagEditor/DagEditor";

interface ModalDagEditorProps {
  isOpen: boolean;
  initialDagString: string;
  onSave: (newValue: any) => void;
  onClose: () => void;
}

export const ModalDagEditor: React.FC<ModalDagEditorProps> = ({
  isOpen,
  initialDagString,
  onSave,
  onClose,
}) => {
  const onOpenModalChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenModalChange}>
      <DialogContent
        className="!flex h-[95vh] max-w-[95vw] !flex-col !gap-y-[20px]"
        tabIndex={undefined}
      >
        <DialogHeader>
          <DialogTitle>Редактирование цепочки</DialogTitle>
        </DialogHeader>
        <DagEditor
          initialDagString={initialDagString}
          graphContainerClassName="flex-grow"
          onSave={onSave}
          onClose={onClose}
          headerClassName="mt-[-14px]"
          footerContainer={DialogFooter}
          footerContainerClassName="!flex items-center !justify-between gap-x-[10px]"
        />
      </DialogContent>
    </Dialog>
  );
};
