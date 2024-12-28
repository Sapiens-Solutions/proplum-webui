import { useEffect, useRef } from "react";

function usePrevious<T>(
  value: T,
  condition?: (value: T) => boolean
): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    if (!condition || condition(value)) {
      ref.current = value;
    }
  }, [value, condition]);
  return ref.current;
}

export default usePrevious;
