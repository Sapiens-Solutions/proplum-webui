import { getTextColumnDef } from "./Columns";
import { DatasourceColumnDef } from "./TablesInfo";

export function getDictionaryDescriptionColumns(): Record<
  string,
  DatasourceColumnDef
> {
  return {
    desc_short: getTextColumnDef({
      columnName: "desc_short",
      label: "Короткое описание",
    }),
    desc_middle: getTextColumnDef({
      columnName: "desc_middle",
      label: "Среднее описание",
    }),
    desc_long: getTextColumnDef({
      columnName: "desc_long",
      label: "Длинное описание",
    }),
  };
}
