const CHAR_WIDTH = 7.34;
const TEXT_FONT = "400 16px ui-sans-serif, system-ui, sans-serif";

const canvas = new OffscreenCanvas(256, 256);
const context = canvas.getContext("2d");
if (context) {
  context.font = TEXT_FONT;
}

export function getTextWidth(text: string): number {
  const width = context
    ? context.measureText(text).width
    : text.length * CHAR_WIDTH;

  return Math.ceil(width);
}
