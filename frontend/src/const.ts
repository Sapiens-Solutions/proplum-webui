import { ColumnValidationType } from "./types";

export const TABLE_PAGE_URL = "/table";
export const TABLE_NAME_QUERY_PARAM = "table_name";

export const TABLE_NAME_TO_LABEL: Record<string, string> = {
  d_extraction_type: "Виды экстракции",
  d_load_type: "Виды загрузки",
  d_load_method: "Методы загрузки",
  d_load_group: "Группы загрузок",
  d_delta_mode: "Режим извлечения данных",
  objects: "Настройка загрузок",
  dependencies: "Зависимости",
  load_constants: "Константы",
  load_info: "История загрузок",
  load_status_today: "Статус текущих загрузок",
  objects_log: "История изменений",
  logs: "Логи",
  chains: "Ведение цепочек",
  chains_info: "История запусков",
  chains_log: "Логи цепочек",
  ext_tables_params: "Параметры внешних таблиц",
};

export const ALLOWED_COLUMN_VALIDATION_TYPES: Record<
  ColumnValidationType,
  boolean
> = {
  interval: true,
  "time without time zone": true,
  "timestamp without time zone": true,
  bigint: false,
  integer: false,
  text: false,
  ARRAY: false,
  jsonb: false,
  cron: false,
};
