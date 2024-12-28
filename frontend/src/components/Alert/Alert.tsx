import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface AlertProps {
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "normal" | "dangerousAction";
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  cancelLabel,
  confirmLabel,
  isOpen,
  onConfirm,
  onCancel,
  type = "normal",
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              type === "dangerousAction"
                ? "bg-[#d23232] text-white hover:bg-[#d23232]/80"
                : ""
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
