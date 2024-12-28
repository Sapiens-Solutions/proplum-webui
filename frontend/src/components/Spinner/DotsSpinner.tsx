import React, { CSSProperties, HTMLAttributes } from "react";

const coords = [
  { x: 22, y: -20 },
  { x: 29, y: 0 },
  { x: 22, y: 20 },
  { x: 0, y: 30 },
  { x: -23, y: 20 },
  { x: -30, y: 0 },
  { x: -23, y: -20 },
  { x: 0, y: -30 },
];

const normalizeSize = (size: CSSProperties["width"]): string => {
  if (!size) return "10px";

  return parseFloat(size.toString()).toString() === size.toString()
    ? `${size}px`
    : size.toString();
};

type DotsSpinnerProps = HTMLAttributes<SVGElement> & {
  speed?: number;
  still?: boolean;
  thickness?: number;
  color: CSSProperties["color"];
  enabled?: boolean;
  size?: CSSProperties["width"];
  style?: CSSProperties;
};

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  speed = 100,
  still = false,
  thickness = 100,
  color,
  enabled = true,
  size = 50,
  style = {},
  ...svgProps
}) => {
  const duration = 200 / speed;
  const generateCircleStyle = (i: number): CSSProperties =>
    !still
      ? {
          animation: `spinners-react-dotted-shrink ${duration}s cubic-bezier(0, 0.9, 0, 0.9) ${
            (duration / 20) * i
          }s infinite`,
        }
      : {};
  const centerStyle: CSSProperties = !still
    ? {
        animation: `spinners-react-dotted-center ${duration}s ease-out infinite`,
        transformOrigin: "center",
      }
    : { display: "none" };

  return enabled ? (
    <svg
      fill="none"
      viewBox="0 0 66 66"
      style={{
        color,
        overflow: "visible",
        width: normalizeSize(size),
        ...style,
      }}
      {...svgProps}
    >
      {coords.map((c, i) => (
        <circle
          key={`${c.x}-${c.y}`}
          cx="33"
          cy="33"
          fill="currentColor"
          r={3 * (thickness / 100)}
          style={{
            transform: `translate(${c.x}px, ${c.y}px)`,
            ...generateCircleStyle(i),
          }}
        />
      ))}
      <circle
        cx="33"
        cy="33"
        fill="currentColor"
        r={6 * (thickness / 100)}
        style={centerStyle}
      />
    </svg>
  ) : null;
};
