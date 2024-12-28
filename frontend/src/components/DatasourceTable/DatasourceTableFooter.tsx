import React from "react";
import CreatableSelect from "react-select/creatable";
import { Button } from "../ui/button";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import styles from "./DatasourceTableFooter.module.css";

type PageSizeOption = {
  value: number;
  label: string;
};

const ROWS_PER_PAGE_OPTIONS_VALUES = [5, 10, 20, 30, 40, 50];

const PAGE_SIZE_OPTIONS: PageSizeOption[] = ROWS_PER_PAGE_OPTIONS_VALUES.map(
  (size) => ({
    value: size,
    label: size.toString(),
  })
);

const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[1];

interface DatasourceTableFooterProps {
  table: Table<any>;
}

export const DatasourceTableFooter: React.FC<DatasourceTableFooterProps> = ({
  table,
}) => {
  return (
    <div className="flex items-center justify-end gap-x-[30px] py-4">
      <div className="mr-auto text-sm font-medium">
        Всего строк: {table.getFilteredRowModel().rows.length}
      </div>
      <div className="flex items-center justify-center whitespace-nowrap text-sm font-medium">
        Страница {table.getState().pagination.pageIndex + 1} из{" "}
        {Math.max(1, table.getPageCount())}
      </div>
      <CreatableSelect
        classNames={{
          control: () => styles.control,
          valueContainer: () => styles.valueContainer,
          indicatorsContainer: () => styles.indicatorsContainer,
          input: () => styles.input,
        }}
        blurInputOnSelect
        className="ring-0"
        maxMenuHeight={600}
        menuPosition="fixed"
        createOptionPosition="first"
        formatCreateLabel={(value) => value}
        value={PAGE_SIZE_OPTIONS.find(
          (option) => option.value === table.getState().pagination.pageSize
        )}
        options={PAGE_SIZE_OPTIONS}
        onChange={(option) =>
          table.setPageSize(option?.value ?? DEFAULT_PAGE_SIZE.value)
        }
      />
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
