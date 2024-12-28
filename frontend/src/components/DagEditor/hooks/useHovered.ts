import { useCallback, useState } from "react";

// Hook that allows to check when some element is hovered, requires to set onMouseEnter and onMouseLeave on desired element
export function useHovered() {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(() => {
    setIsHovered(false);
  }, []);

  return { isHovered, onMouseEnter, onMouseLeave };
}
