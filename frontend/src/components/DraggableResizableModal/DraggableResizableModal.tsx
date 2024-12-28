import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDraggable } from "./hooks/useDraggable";
import { useTableStore } from "@/store/tableStore";
import { GripVertical, X } from "lucide-react";
import { Separator } from "../ui/separator";

export const MODAL_ANIMATION_DURATION_MS = 300;

const MODAL_APPEAR_ANIMATION = `modal-appear ${MODAL_ANIMATION_DURATION_MS}ms 0ms ease-out forwards`;
const MODAL_DISAPPEAR_ANIMATION = `modal-disappear ${MODAL_ANIMATION_DURATION_MS}ms 0ms ease-out forwards`;

interface DraggableResizableModalProps {
  id: string;
  content: React.FC<any>;
  contentProps: any;
  label?: string;
  initialLeftOffset?: number;
  initialTopOffset?: number;
}

export const DraggableResizableModal: React.FC<
  DraggableResizableModalProps
> = ({
  id,
  content,
  contentProps,
  label = "Draggable header",
  initialLeftOffset,
  initialTopOffset,
}) => {
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const [isClosing, setIsClosing] = useState<boolean>(false);

  const modalsCloseTrigger = useTableStore((state) => state.modalsCloseTrigger);
  const removeModal = useTableStore((state) => state.removeModal);

  const { onDraggableElementMouseDown } = useDraggable({
    draggableElementRef: modalContainerRef,
    initialLeftOffset,
    initialTopOffset,
  });

  const onClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => removeModal(id), MODAL_ANIMATION_DURATION_MS + 200);
  }, [id, removeModal]);

  useEffect(() => {
    if (modalsCloseTrigger !== undefined) {
      onClose();
    }
  }, [modalsCloseTrigger, onClose]);

  const Content = content;

  return (
    <div
      className="absolute z-[9] whitespace-nowrap rounded-md rounded-b-md border-[1px] border-solid border-[#d3d3d3] bg-white transition-[opacity,transform] duration-300"
      ref={modalContainerRef}
      style={{
        animation: isClosing
          ? MODAL_DISAPPEAR_ANIMATION
          : MODAL_APPEAR_ANIMATION,
      }}
    >
      <header
        className="relative z-[10] flex w-full cursor-move items-center rounded-t-md p-[6px] pr-[60px] font-medium"
        onMouseDown={onDraggableElementMouseDown}
      >
        <GripVertical className="mr-1 block h-5 w-5" />
        {label}
        <div
          onClick={onClose}
          className="absolute right-[8px] top-[50%] translate-y-[-50%] cursor-pointer p-1 transition-opacity hover:opacity-80"
        >
          <X className="block h-5 w-5 rounded-[100%] bg-[#E9413D] p-[2px] text-white" />
        </div>
      </header>
      <Separator orientation="horizontal" />
      <Content {...contentProps} onClose={onClose} />
      <Separator orientation="horizontal" />
      <footer
        onMouseDown={onDraggableElementMouseDown}
        className="z-[10] flex h-[48px] w-full cursor-move items-center justify-center rounded-b-md"
      ></footer>
    </div>
  );
};
