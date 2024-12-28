import { Column } from "@tanstack/react-table";
import { CSSProperties } from "react";

// Returns styles to make sticky column pinning work
export function getCommonPinningStyles(column: Column<any>): CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");

  const leftMargin = isPinned ? column.getStart("left") : 0;

  return {
    // Shadow for last pinned column
    boxShadow: isLastLeftPinnedColumn ? "0 0 15px rgba(0,0,0,0.15)" : undefined,
    clipPath: isLastLeftPinnedColumn ? "inset(0px -15px 0px 0px)" : undefined,

    // Left offset for pinned columns
    left: isPinned === "left" ? `${leftMargin}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 2 : undefined,

    width: isPinned ? column.getSize() : undefined,

    // Padding for last pinned column
    paddingRight: isLastLeftPinnedColumn && leftMargin > 0 ? "32px" : undefined,
  };
}
