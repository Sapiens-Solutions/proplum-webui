import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Cells.module.css";
import { BaseCellProps } from "./types";
import { cn } from "@/lib/utils";

type TableLinkCellProps = Pick<BaseCellProps, "row" | "isAddedRow"> & {
  linkColumnName: string;
  linkTableName: string;
  cellLabel: string;
};

export const TableLinkCell: React.FC<TableLinkCellProps> = ({
  row,
  linkColumnName,
  linkTableName,
  cellLabel,
  isAddedRow = false,
}) => {
  const linkColumnValue: string | number = row.getValue(linkColumnName);

  return isAddedRow ? (
    // Use empty button to make cell tabbable
    <button className={cn(styles.emptyButtonCell, "ml-[11px]")} />
  ) : (
    <NavLink
      to={`/table/${linkTableName}?${linkColumnName}=$${linkColumnValue}`}
      className="ml-[11px] flex cursor-pointer items-center gap-1 text-link underline transition-opacity duration-200 hover:opacity-70"
    >
      {cellLabel}
    </NavLink>
  );
};
