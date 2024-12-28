import { useLayoutEffect, useMemo, useRef } from "react";

function debounce(func: (...args: any[]) => void, delay = 300) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export const useDebounce = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo<(...args: any[]) => void>(
    () => debounce((...args) => callbackRef.current(...args), delay),
    [delay]
  );
};
