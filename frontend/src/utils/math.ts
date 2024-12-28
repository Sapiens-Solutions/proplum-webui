export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
