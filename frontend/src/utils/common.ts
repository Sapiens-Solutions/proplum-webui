import { AxiosError } from "axios";

export function parseAxiosErrorMessage(
  error: AxiosError | null,
  fallbackErrorMessage = "Неизвестная ошибка"
): string {
  return (
    (error?.response?.data as { detail?: string })?.detail ??
    error?.message ??
    fallbackErrorMessage
  );
}

export function getBlockPositionForScreenCenter(
  blockWidth: number,
  blockHeight: number
): { x: number; y: number } {
  return {
    x: window.innerWidth / 2 - blockWidth / 2,
    y: window.innerHeight / 2 - blockHeight / 2,
  };
}
