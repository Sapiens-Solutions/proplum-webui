import { UpdateRowFunc } from "@/store/tableStore";
import { ColumnValidationType } from "@/types";
import { Row } from "@tanstack/react-table";

export type BaseCellProps = {
  columnName: string;
  row: Row<any>;
  disabled?: boolean;
  onUpdateCell: UpdateRowFunc;
  isAddedRow?: boolean;
  className?: string;
  doAfterValueChange?: (value: any) => void;
  validationType?: ColumnValidationType;
};
