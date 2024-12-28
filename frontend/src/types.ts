export type ColumnValidationType =
  | "integer"
  | "bigint"
  | "text"
  | "ARRAY"
  | "time without time zone"
  | "timestamp without time zone"
  | "interval"
  | "jsonb"
  | "cron";

export type DagObject = {
  id: number | string;
  name?: string;
  description?: string;
};
