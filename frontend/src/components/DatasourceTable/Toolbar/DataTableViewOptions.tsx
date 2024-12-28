import { Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../../ui/button";
import { TableColumnMeta } from "../TablesInfo/TablesInfo";
import styles from "./DataTableViewOptions.module.css";
import { MixerHorizontal } from "@/components/Icons/MixerHorizontal";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps {
  table: Table<any>;
}

export const DataTableViewOptions: React.FC<DataTableViewOptionsProps> = ({
  table,
}) => {
  const columns = table.getAllColumns().filter((column) => column.getCanHide());
  const isAllColumnsVisible = table.getIsAllColumnsVisible();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={styles.columnsViewButton}>
          <MixerHorizontal className="mr-2 h-4 w-4" />
          Колонки
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ScrollArea
          className={cn("w-48", columns.length > 9 ? "h-72" : "h-fit")}
        >
          <DropdownMenuCheckboxItem
            checked={isAllColumnsVisible}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() =>
              table.toggleAllColumnsVisible(!isAllColumnsVisible)
            }
          >
            Все
          </DropdownMenuCheckboxItem>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              onSelect={(e) => e.preventDefault()}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {(column.columnDef.meta as TableColumnMeta)?.label ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
