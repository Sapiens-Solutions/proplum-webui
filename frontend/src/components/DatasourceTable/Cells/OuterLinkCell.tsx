import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Cells.module.css";
import { BaseCellProps } from "./types";

type OuterLinkCellProps = Pick<BaseCellProps, "isAddedRow"> & {
  link: string;
  cellLabel: string;
};

export const OuterLinkCell: React.FC<OuterLinkCellProps> = ({
  link,
  cellLabel,
  isAddedRow = false,
}) => {
  return isAddedRow ? (
    // Use empty button to make cell tabbable
    <button className={styles.emptyButtonCell} />
  ) : (
    <div className="cursor-pointer text-link underline transition-opacity duration-200 hover:opacity-70">
      <NavLink to={link} target="_blank">
        {cellLabel}
      </NavLink>
    </div>
  );
};
