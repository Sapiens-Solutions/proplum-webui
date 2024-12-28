import { IconButton } from "@/components/IconButton/IconButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTableStore } from "@/store/tableStore";
import { Table } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

interface CancelEditingsButtonProps {
  table: Table<any>;
}

export const CancelEditingsButton: React.FC<CancelEditingsButtonProps> = ({
  table,
}) => {
  const editedRows = useTableStore((state) => state.editedRows);
  const addedRows = useTableStore((state) => state.addedRows);
  const clearEditings = useTableStore((state) => state.clearEditings);

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const canCancelEditings = useMemo<boolean>(
    () =>
      Object.keys(editedRows).length > 0 || Object.keys(addedRows).length > 0,
    [editedRows, addedRows]
  );

  const onCancelEditings = () => {
    setIsAlertOpen(false);
    clearEditings(() => table.setRowSelection({}));
  };

  const onDialogOpenChange = useCallback((open: boolean) => {
    setIsAlertOpen(open);
  }, []);

  return (
    <div>
      <IconButton
        tooltipMessage="Отменить все изменения"
        icon={RotateCcw}
        onClick={
          canCancelEditings
            ? () => setIsAlertOpen((prevValue) => !prevValue)
            : () => {}
        }
        disabled={!canCancelEditings}
        className={
          canCancelEditings
            ? "cursor-pointer bg-[#d23232] text-white hover:bg-[#d23232]/80"
            : "cursor-not-allowed bg-gray-50 text-gray-400"
        }
      />
      {isAlertOpen ? (
        <Dialog open={isAlertOpen} onOpenChange={onDialogOpenChange}>
          <DialogTrigger asChild>
            <div />
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[425px] md:max-w-[600px]"
            tabIndex={undefined}
          >
            <DialogHeader>
              <DialogTitle>Вы уверены?</DialogTitle>
              <DialogDescription>
                Все добавленные строки будут удалены, а изменения в ячейках
                исчезнут.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="!flex items-center gap-x-[12px]">
              <Button
                onClick={() => setIsAlertOpen(false)}
                className="w-[135px]"
                variant="outline"
              >
                Отменить
              </Button>
              <Button onClick={onCancelEditings} className="w-[135px]">
                Подтверждаю
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
};
