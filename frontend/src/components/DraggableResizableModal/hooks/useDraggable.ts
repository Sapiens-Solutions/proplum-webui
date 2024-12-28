import { useCallback, useEffect, useRef } from "react";
import { clamp } from "@/utils/math";

function closeDragElement() {
  // Stop moving when mouse button is released:
  document.onmouseup = null;
  document.onmousemove = null;
}

function setElementOffsets(
  elementRef: React.RefObject<HTMLDivElement>,
  topOffset: number,
  leftOffset: number
) {
  elementRef.current!.style.top =
    elementRef.current!.offsetTop - topOffset + "px";
  elementRef.current!.style.left =
    elementRef.current!.offsetLeft - leftOffset + "px";
}

function setElementToStartPosition(
  elementRef: React.RefObject<HTMLDivElement>,
  initialLeftOffset = 10,
  initialTopOffset = 10
) {
  if (elementRef.current) {
    const elementWidth = elementRef.current.clientWidth;
    const elementHeight = elementRef.current.clientHeight;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const topOffset = clamp(
      0,
      initialTopOffset - 20,
      windowHeight - elementHeight - 10
    );
    const leftOffset = clamp(
      0,
      initialLeftOffset + 20,
      windowWidth - elementWidth - 10
    );

    elementRef.current.style.top = `${topOffset}px`;
    elementRef.current.style.left = `${leftOffset}px`;
  }
}

interface UseDraggableProps {
  draggableElementRef: React.RefObject<HTMLDivElement>;
  initialLeftOffset?: number;
  initialTopOffset?: number;
}

export const useDraggable = ({
  draggableElementRef,
  initialLeftOffset = 10,
  initialTopOffset = 10,
}: UseDraggableProps) => {
  // Numbers for calculating draggable object position
  const positions = useRef<{
    leftOffset: number;
    topOffset: number;
    mousePositionX: number;
    mousePositionY: number;
  }>({
    leftOffset: 0,
    topOffset: 0,
    mousePositionX: 0,
    mousePositionY: 0,
  });

  useEffect(() => {
    setElementToStartPosition(
      draggableElementRef,
      initialLeftOffset,
      initialTopOffset
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLeftOffset, initialTopOffset]);

  const elementDrag = useCallback((event: MouseEvent) => {
    event.preventDefault();
    // Calculate the new cursor position:
    positions.current.leftOffset =
      positions.current.mousePositionX - event.clientX;
    positions.current.topOffset =
      positions.current.mousePositionY - event.clientY;

    positions.current.mousePositionX = event.clientX;
    positions.current.mousePositionY = event.clientY;

    // Set modal's new position
    setElementOffsets(
      draggableElementRef,
      positions.current.topOffset,
      positions.current.leftOffset
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDraggableElementMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();

      // Get the mouse cursor position at startup:
      positions.current.mousePositionX = event.clientX;
      positions.current.mousePositionY = event.clientY;

      document.onmouseup = closeDragElement;

      // Call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    },
    [elementDrag]
  );

  return { onDraggableElementMouseDown };
};
