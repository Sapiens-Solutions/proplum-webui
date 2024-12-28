import React from "react";
import { Handle, HandleType, Position } from "@xyflow/react";

interface CustomHandleProps {
  type: HandleType;
  position: Position.Left | Position.Top | Position.Right | Position.Bottom;
  className?: string;
}

export const CustomHandle: React.FC<CustomHandleProps> = ({
  type,
  position,
  className = "",
}) => {
  const handleStyle: React.CSSProperties = {
    transform: "translateY(0px)",
    borderWidth: "0px",
    width: "16px",
    height: "100%",
    background: "rgba(0, 0, 0, 0.1)",
    top: 0,
    bottom: 0,
    margin: "auto 0",
  };

  switch (position) {
    case Position.Left:
      handleStyle.left = "0";
      handleStyle.borderRadius = "6px 0px 0px 6px";
      break;
    case Position.Right:
      handleStyle.right = "0";
      handleStyle.borderRadius = "0px 6px 6px 0px";
      break;
    case Position.Bottom:
      handleStyle.left = "-1px";
      handleStyle.bottom = "-2px";
      handleStyle.width = "calc(100% + 2px)";
      handleStyle.height = "15px";
      break;
    case Position.Top:
      handleStyle.left = "-1px";
      handleStyle.top = "0px";
      handleStyle.width = "calc(100% + 2px)";
      handleStyle.height = "15px";
      break;
    default:
      break;
  }

  return (
    <Handle
      type={type}
      position={position}
      style={handleStyle}
      className={className}
    />
  );
};
