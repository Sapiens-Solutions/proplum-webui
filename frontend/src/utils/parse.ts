export function parseTextValue(value: string) {
  return value;
}

export function parseNumberValue(value: string | number | null) {
  if (value === null) return 0;

  const parsedNumber = Number(value);

  return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
}
