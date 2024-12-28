import React, { useCallback, useState } from "react";
import { TextCell, TextCellProps } from "./TextCell";
import { NavLink } from "react-router-dom";
import { getAirflowJobLink } from "@/utils/airflow";
import { AirflowIcon } from "@/components/Icons/AirflowIcon";

type AirflowJobCell = TextCellProps;

export const AirflowJobCell: React.FC<AirflowJobCell> = ({
  columnName,
  row,
  disabled = false,
  onUpdateCell,
  type = "text",
  isAddedRow = false,
}) => {
  const [airflowJobLink, setAirflowJobLink] = useState<string>("");

  // Get job name from text cell input and update airflow link
  const onInputChange = useCallback((newValue: string) => {
    setAirflowJobLink(getAirflowJobLink(newValue));
  }, []);

  return (
    // z-index here should be less than z-index of pinned column (1)
    <div className="relative z-[1]">
      <TextCell
        columnName={columnName}
        row={row}
        onUpdateCell={onUpdateCell}
        disabled={disabled}
        isAddedRow={isAddedRow}
        type={type}
        className="pr-[15px]"
        doAfterValueChange={onInputChange}
      />
      {airflowJobLink ? (
        <NavLink
          to={airflowJobLink}
          className="group absolute bottom-0 right-[-27px] top-0 my-auto flex w-[35px] cursor-pointer justify-center transition-opacity duration-200 hover:opacity-70 focus-visible:outline-0"
          target="_blank"
        >
          <AirflowIcon className="block h-full w-[16px] min-w-[16px] text-darkblue group-hover:animate-spin group-focus-visible:animate-spin" />
        </NavLink>
      ) : null}
    </div>
  );
};
