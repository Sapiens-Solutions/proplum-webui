import {
  CellContext,
  ColumnDef,
  ColumnDefTemplate,
} from "@tanstack/react-table";
import {
  getBooleanColumnDef,
  getTextColumnDef,
  getJsonColumnDef,
  getTableLinkColumnDef,
  getTextArrayColumnDef,
  getNumberColumnDef,
  getSelectValueFromOtherTableColumn,
  getGenerateLoadIdColumnDef,
  getTextColumnWithAirflowIconLinkDef,
  getDagEditorColumnDef,
} from "./Columns";
import { getDefaultDeleteRowFieldsObject, getDefaultGetRowId } from "./utils";
import { UpdateRowFunc } from "@/store/tableStore";
import { ColumnValidationType } from "@/types";
import { DatasourceTableProps } from "../DatasourceTable";
import { getDictionaryDescriptionColumns } from "./descriptionColumns";

export type TableInfo = {
  primaryKeyColumn: string;
  /** Maps column names to column description object */
  columns: { [columnName: string]: DatasourceColumnDef };
  /** Function for getting unique row ID */
  getRowId: (row: Record<string, any>) => string;
  /** Function for getting row values that are needed for sending request to delete row.
   * In simple case this just sends value of primary key column.
   */
  getDeleteRowFieldsObject: (row: Record<string, any>) => Record<string, any>;
  /** Columns that are not received from backend but need to be shown*/
  additionalColumns?: DatasourceColumnDef[];
  /** Order index for additional columns */
  additionalColumnsStartIndex?: number;
  /** Can table be edited or not */
  isEditable?: boolean;
  /** If table has rows with repeating primary keys this should be true for unique key of each row in table */
  shouldUseRowIndexAsRowKey?: boolean;
  /** Initial data for new rows */
  newRowTemplate?: Record<string, any>;
};

export type DatasourceTableMeta = {
  isEditing: boolean;
  updateCell: UpdateRowFunc;
  onColumnPin: DatasourceTableProps["onColumnPin"];
};

export type TableColumnMeta = {
  label?: string;
};

export type DatasourceColumnDef = Omit<ColumnDef<any>, "cell"> & {
  accessorKey: string;
  label: string;
  cellClassName: string;
  isEditable?: boolean;
  cell?: ColumnDefTemplate<DatasourceTableCellContext>;
  comment?: string | null;
  validationType?: ColumnValidationType;
};

export type DatasourceTableCellContext = CellContext<any, unknown> & {
  visibleRowIndex?: number;
  isAddedRow?: boolean;
  isRowDeleted?: boolean;
  isEditable?: boolean;
};

export const COLUMNS_SELECT_INFO = {
  extraction_type: {
    columnName: "extraction_type",
    label: "extraction_type",
    valueType: "text",
    referredTableName: "d_extraction_type",
    referredValueColumnName: "extraction_type",
    referredDescriptionColumnName: "desc_long",
  },
  load_type: {
    columnName: "load_type",
    label: "load_type",
    valueType: "text",
    referredTableName: "d_load_type",
    referredValueColumnName: "load_type",
    referredDescriptionColumnName: "desc_long",
  },
  load_method: {
    columnName: "load_method",
    label: "load_method",
    valueType: "text",
    referredTableName: "d_load_method",
    referredValueColumnName: "load_method",
    referredDescriptionColumnName: "desc_long",
  },
  delta_mode: {
    columnName: "delta_mode",
    label: "delta_mode",
    valueType: "text",
    referredTableName: "d_delta_mode",
    referredValueColumnName: "delta_mode",
    referredDescriptionColumnName: "desc_long",
  },
  load_group: {
    columnName: "load_group",
    label: "load_group",
    valueType: "text",
    referredTableName: "d_load_group",
    referredValueColumnName: "load_group",
    referredDescriptionColumnName: "desc_long",
  },
} as const;

// Contains description of columns for each table
export const TABLES_INFO: { [tableName: string]: TableInfo } = {
  d_extraction_type: {
    primaryKeyColumn: "extraction_type",
    getRowId: getDefaultGetRowId("extraction_type"),
    getDeleteRowFieldsObject:
      getDefaultDeleteRowFieldsObject("extraction_type"),
    isEditable: true,
    columns: {
      extraction_type: getTextColumnDef({
        columnName: "extraction_type",
        label: "Метод загрузки",
        isEditable: false,
      }),
      ...getDictionaryDescriptionColumns(),
    },
  },

  d_load_type: {
    primaryKeyColumn: "load_type",
    getRowId: getDefaultGetRowId("load_type"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("load_type"),
    isEditable: true,
    columns: {
      load_type: getTextColumnDef({
        columnName: "load_type",
        label: "Тип загрузки",
        isEditable: false,
      }),
      ...getDictionaryDescriptionColumns(),
    },
  },

  d_load_method: {
    primaryKeyColumn: "load_method",
    getRowId: getDefaultGetRowId("load_method"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("load_method"),
    isEditable: true,
    columns: {
      load_method: getTextColumnDef({
        columnName: "load_method",
        label: "Метод загрузки",
        isEditable: false,
      }),
      ...getDictionaryDescriptionColumns(),
    },
  },

  d_load_group: {
    primaryKeyColumn: "load_group",
    getRowId: getDefaultGetRowId("load_group"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("load_group"),
    isEditable: true,
    columns: {
      load_group: getTextColumnDef({
        columnName: "load_group",
        label: "Группа загрузки",
        isEditable: false,
      }),
      ...getDictionaryDescriptionColumns(),
    },
  },

  d_delta_mode: {
    primaryKeyColumn: "delta_mode",
    getRowId: getDefaultGetRowId("delta_mode"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("delta_mode"),
    isEditable: true,
    columns: {
      delta_mode: getTextColumnDef({
        columnName: "delta_mode",
        label: "Шаблон загрузки",
        isEditable: false,
      }),
      ...getDictionaryDescriptionColumns(),
    },
  },

  objects: {
    primaryKeyColumn: "object_id",
    getRowId: getDefaultGetRowId("object_id"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("object_id"),
    newRowTemplate: {
      active: true,
      column_name_mapping: null,
      transform_mapping: null,
    },
    isEditable: true,
    columns: {
      object_id: getNumberColumnDef({
        columnName: "object_id",
        label: "object_id",
        isEditable: false,
        isContextMenuVisible: true,
      }),
      object_name: getTextColumnDef({
        columnName: "object_name",
        label: "Имя объекта",
      }),
      object_desc: getTextColumnDef({
        columnName: "object_desc",
        label: "Описание объекта",
      }),
      extraction_type: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.extraction_type
      ),
      load_type: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.load_type
      ),
      merge_key: getTextArrayColumnDef({
        columnName: "merge_key",
        label: "merge_key",
      }),
      delta_field: getTextColumnDef({
        columnName: "delta_field",
        label: "delta_field",
      }),
      delta_field_format: getTextColumnDef({
        columnName: "delta_field_format",
        label: "delta_field_format",
      }),
      delta_safety_period: getTextColumnDef({
        columnName: "delta_safety_period",
        label: "delta_safety_period",
      }),
      bdate_field: getTextColumnDef({
        columnName: "bdate_field",
        label: "bdate_field",
      }),
      bdate_field_format: getTextColumnDef({
        columnName: "bdate_field_format",
        label: "bdate_field_format",
      }),
      bdate_safety_period: getTextColumnDef({
        columnName: "bdate_safety_period",
        label: "bdate_safety_period",
      }),
      load_method: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.load_method
      ),
      responsible_mail: getTextArrayColumnDef({
        columnName: "responsible_mail",
        label: "responsible_mail",
      }),
      priority: getNumberColumnDef({
        columnName: "priority",
        label: "priority",
      }),
      periodicity: getTextColumnDef({
        columnName: "periodicity",
        label: "periodicity",
      }),
      load_interval: getTextColumnDef({
        columnName: "load_interval",
        label: "load_interval",
      }),
      activitystart: getTextColumnDef({
        columnName: "activitystart",
        label: "activitystart",
      }),
      activityend: getTextColumnDef({
        columnName: "activityend",
        label: "activityend",
      }),
      active: getBooleanColumnDef({ columnName: "active", label: "active" }),
      load_start_date: getTextColumnDef({
        columnName: "load_start_date",
        label: "load_start_date",
      }),
      delta_start_date: getTextColumnDef({
        columnName: "delta_start_date",
        label: "delta_start_date",
      }),
      delta_mode: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.delta_mode
      ),
      connect_string: getTextColumnDef({
        columnName: "connect_string",
        label: "connect_string",
      }),
      load_function_name: getTextColumnDef({
        columnName: "load_function_name",
        label: "load_function_name",
      }),
      where_clause: getTextColumnDef({
        columnName: "where_clause",
        label: "where_clause",
      }),
      load_group: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.load_group
      ),
      src_date_type: getTextColumnDef({
        columnName: "src_date_type",
        label: "src_date_type",
      }),
      src_ts_type: getTextColumnDef({
        columnName: "src_ts_type",
        label: "src_ts_type",
      }),
      column_name_mapping: getJsonColumnDef({
        columnName: "column_name_mapping",
        label: "column_name_mapping",
      }),
      transform_mapping: getJsonColumnDef({
        columnName: "transform_mapping",
        label: "transform_mapping",
      }),
      delta_field_type: getTextColumnDef({
        columnName: "delta_field_type",
        label: "delta_field_type",
      }),
      bdate_field_type: getTextColumnDef({
        columnName: "bdate_field_type",
        label: "bdate_field_type",
      }),
    },
    additionalColumns: [
      getGenerateLoadIdColumnDef({
        columnName: "load_id_generation",
        label: "Генерация",
      }),
      getTextColumnWithAirflowIconLinkDef({
        columnName: "job_name",
        label: "Задание по загрузке",
      }),
      getTableLinkColumnDef(
        "load_history",
        "История загрузок",
        "load_info",
        "Подробная информация",
        "object_id"
      ),
      getTableLinkColumnDef(
        "changes_history",
        "История изменений",
        "objects_log",
        "Подробная информация",
        "object_id"
      ),
    ],
    additionalColumnsStartIndex: 3,
  },

  objects_log: {
    primaryKeyColumn: "object_id",
    getRowId: (row) => {
      return `${row["object_id"]}-${row["change_timestamp"]}`;
    },
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("object_id"),
    isEditable: false,
    shouldUseRowIndexAsRowKey: true,
    columns: {
      object_id: getNumberColumnDef({
        columnName: "object_id",
        label: "object_id",
        isEditable: false,
        isContextMenuVisible: true,
      }),
      object_name: getTextColumnDef({
        columnName: "object_name",
        label: "Имя объекта",
      }),
      object_desc: getTextColumnDef({
        columnName: "object_desc",
        label: "Описание объекта",
      }),
      extraction_type: getTextColumnDef({
        columnName: "extraction_type",
        label: "Метод загрузки",
      }),
      load_type: getTextColumnDef({
        columnName: "load_type",
        label: "Тип загрузки",
      }),
      merge_key: getTextArrayColumnDef({
        columnName: "merge_key",
        label: "merge_key",
      }),
      delta_field: getTextColumnDef({
        columnName: "delta_field",
        label: "delta_field",
      }),
      delta_field_format: getTextColumnDef({
        columnName: "delta_field_format",
        label: "delta_field_format",
      }),
      delta_safety_period: getTextColumnDef({
        columnName: "delta_safety_period",
        label: "delta_safety_period",
      }),
      bdate_field: getTextColumnDef({
        columnName: "bdate_field",
        label: "bdate_field",
      }),
      bdate_field_format: getTextColumnDef({
        columnName: "bdate_field_format",
        label: "bdate_field_format",
      }),
      bdate_safety_period: getTextColumnDef({
        columnName: "bdate_safety_period",
        label: "bdate_safety_period",
      }),
      load_method: getTextColumnDef({
        columnName: "load_method",
        label: "Метод загрузки",
      }),
      job_name: getTextColumnWithAirflowIconLinkDef({
        columnName: "job_name",
        label: "job_name",
      }),
      responsible_mail: getTextArrayColumnDef({
        columnName: "responsible_mail",
        label: "responsible_mail",
      }),
      priority: getNumberColumnDef({
        columnName: "priority",
        label: "priority",
      }),
      periodicity: getTextColumnDef({
        columnName: "periodicity",
        label: "periodicity",
      }),
      load_interval: getTextColumnDef({
        columnName: "load_interval",
        label: "load_interval",
      }),
      activitystart: getTextColumnDef({
        columnName: "activitystart",
        label: "activitystart",
      }),
      activityend: getTextColumnDef({
        columnName: "activityend",
        label: "activityend",
      }),
      active: getBooleanColumnDef({ columnName: "active", label: "active" }),
      load_start_date: getTextColumnDef({
        columnName: "load_start_date",
        label: "load_start_date",
      }),
      delta_start_date: getTextColumnDef({
        columnName: "delta_start_date",
        label: "delta_start_date",
      }),
      delta_mode: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.delta_mode
      ),
      connect_string: getTextColumnDef({
        columnName: "connect_string",
        label: "connect_string",
      }),
      load_function_name: getTextColumnDef({
        columnName: "load_function_name",
        label: "load_function_name",
      }),
      where_clause: getTextColumnDef({
        columnName: "where_clause",
        label: "where_clause",
      }),
      load_group: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.load_group
      ),
      src_date_type: getTextColumnDef({
        columnName: "src_date_type",
        label: "src_date_type",
      }),
      src_ts_type: getTextColumnDef({
        columnName: "src_ts_type",
        label: "src_ts_type",
      }),
      column_name_mapping: getJsonColumnDef({
        columnName: "column_name_mapping",
        label: "column_name_mapping",
      }),
      transform_mapping: getJsonColumnDef({
        columnName: "transform_mapping",
        label: "transform_mapping",
      }),
      delta_field_type: getTextColumnDef({
        columnName: "delta_field_type",
        label: "delta_field_type",
      }),
      bdate_field_type: getTextColumnDef({
        columnName: "bdate_field_type",
        label: "bdate_field_type",
      }),
      change_type: getTextColumnDef({
        columnName: "change_type",
        label: "Тип изменения",
      }),
      change_timestamp: getTextColumnDef({
        columnName: "change_timestamp",
        label: "Время изменения",
      }),
      change_username: getTextColumnDef({
        columnName: "change_username",
        label: "Пользователь",
      }),
    },
  },

  dependencies: {
    primaryKeyColumn: "object_id",
    getRowId: (row) => {
      return `${row["object_id"]}-${row["object_id_depend"]}`;
    },
    getDeleteRowFieldsObject: (row) => ({
      object_id: row["object_id"],
      object_id_depend: row["object_id_depend"],
    }),
    isEditable: true,
    shouldUseRowIndexAsRowKey: true,
    columns: {
      object_id: getSelectValueFromOtherTableColumn({
        columnName: "object_id",
        label: "object_id",
        valueType: "number",
        referredTableName: "objects",
        referredValueColumnName: "object_id",
        referredDescriptionColumnName: undefined,
        isEditable: false,
      }),
      object_id_depend: getSelectValueFromOtherTableColumn({
        columnName: "object_id_depend",
        label: "object_id_depend",
        valueType: "number",
        referredTableName: "objects",
        referredValueColumnName: "object_id",
        referredDescriptionColumnName: undefined,
        isEditable: false,
      }),
    },
  },

  load_constants: {
    primaryKeyColumn: "constant_name",
    getRowId: getDefaultGetRowId("constant_name"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("constant_name"),
    isEditable: true,
    columns: {
      constant_name: getTextColumnDef({
        columnName: "constant_name",
        label: "constant_name",
        isEditable: false,
      }),
      constant_value: getTextColumnDef({
        columnName: "constant_value",
        label: "constant_value",
      }),
    },
  },

  load_info: {
    primaryKeyColumn: "load_id",
    getRowId: getDefaultGetRowId("load_id"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("load_id"),
    isEditable: true,
    columns: {
      load_id: getNumberColumnDef({
        columnName: "load_id",
        label: "load_id",
        isEditable: false,
        isContextMenuVisible: true,
      }),
      load_status: getNumberColumnDef({
        columnName: "load_status",
        label: "load_status",
      }),
      object_id: getNumberColumnDef({
        columnName: "object_id",
        label: "object_id",
      }),
      extraction_from: getTextColumnDef({
        columnName: "extraction_from",
        label: "extraction_from",
      }),
      extraction_to: getTextColumnDef({
        columnName: "extraction_to",
        label: "extraction_to",
      }),
      load_from: getTextColumnDef({
        columnName: "load_from",
        label: "load_from",
      }),
      load_to: getTextColumnDef({ columnName: "load_to", label: "load_to" }),
      created_dttm: getTextColumnDef({
        columnName: "created_dttm",
        label: "created",
      }),
      updated_dttm: getTextColumnDef({
        columnName: "updated_dttm",
        label: "changed",
      }),
      row_cnt: getNumberColumnDef({ columnName: "row_cnt", label: "row_cnt" }),
    },
    additionalColumns: [
      getTableLinkColumnDef(
        "logs",
        "logs",
        "logs",
        "Подробная информация",
        "load_id"
      ),
    ],
  },

  logs: {
    primaryKeyColumn: "log_id",
    getRowId: getDefaultGetRowId("log_id"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("log_id"),
    isEditable: false,
    columns: {
      log_id: getNumberColumnDef({
        columnName: "log_id",
        label: "log_id",
        isEditable: false,
        isContextMenuVisible: true,
      }),
      load_id: getNumberColumnDef({ columnName: "load_id", label: "load_id" }),
      log_timestamp: getTextColumnDef({
        columnName: "log_timestamp",
        label: "log_timestamp",
      }),
      log_type: getTextColumnDef({ columnName: "log_type", label: "log_type" }),
      log_msg: getTextColumnDef({ columnName: "log_msg", label: "log_msg" }),
      log_location: getTextColumnDef({
        columnName: "log_location",
        label: "log_location",
      }),
      is_error: getBooleanColumnDef({
        columnName: "is_error",
        label: "is_error",
      }),
      log_user: getTextColumnDef({
        columnName: "log_user",
        label: "log_user",
      }),
    },
  },

  load_status_today: {
    primaryKeyColumn: "load_group",
    getRowId: getDefaultGetRowId("load_group"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("load_group"),
    isEditable: false,
    shouldUseRowIndexAsRowKey: true,
    columns: {
      load_group: getTextColumnDef({
        columnName: "load_group",
        label: "load_group",
        isEditable: false,
      }),
      "id объекта": getNumberColumnDef({
        columnName: "id объекта",
        label: "id объекта",
        isContextMenuVisible: true,
      }),
      "Имя таблицы": getTextColumnDef({
        columnName: "Имя таблицы",
        label: "Имя таблицы",
      }),
      "Описание загрузки": getTextColumnDef({
        columnName: "Описание загрузки",
        label: "Описание загрузки",
      }),
      "Статус загрузки": getTextColumnDef({
        columnName: "Статус загрузки",
        label: "Статус загрузки",
      }),
      "Загружено записей": getTextColumnDef({
        columnName: "Загружено записей",
        label: "Загружено записей",
      }),
      "Последнее обновление": getTextColumnDef({
        columnName: "Последнее обновление",
        label: "Последнее обновление",
      }),
    },
  },

  chains: {
    primaryKeyColumn: "chain_name",
    getRowId: getDefaultGetRowId("chain_name"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("chain_name"),
    isEditable: true,
    newRowTemplate: {
      schedule: "None",
      active: true,
    },
    columns: {
      chain_name: getTextColumnDef({
        columnName: "chain_name",
        label: "chain_name",
        isEditable: false,
        isContextMenuVisible: true,
      }),
      chain_description: getTextColumnDef({
        columnName: "chain_description",
        label: "chain_description",
      }),
      active: getBooleanColumnDef({
        columnName: "active",
        label: "active",
      }),
      schedule: getTextColumnDef({
        columnName: "schedule",
        label: "schedule",
        validationType: "cron",
      }),
      job_name: getTextColumnWithAirflowIconLinkDef({
        columnName: "job_name",
        label: "job_name",
      }),
      sequence: getDagEditorColumnDef({
        columnName: "sequence",
        label: "sequence",
      }),
    },
  },

  chains_info: {
    primaryKeyColumn: "instance_id",
    getRowId: getDefaultGetRowId("instance_id"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("instance_id"),
    isEditable: true,
    columns: {
      instance_id: getNumberColumnDef({
        columnName: "instance_id",
        label: "instance_id",
        isEditable: false,
        isContextMenuVisible: true,
      }),
      chain_name: getTextColumnDef({
        columnName: "chain_name",
        label: "chain_name",
      }),
      load_from: getTextColumnDef({
        columnName: "load_from",
        label: "load_from",
      }),
      load_to: getTextColumnDef({
        columnName: "load_to",
        label: "load_to",
      }),
      status: getNumberColumnDef({
        columnName: "status",
        label: "status",
      }),
      chain_start: getTextColumnDef({
        columnName: "chain_start",
        label: "chain_start",
      }),
      chain_finish: getTextColumnDef({
        columnName: "chain_finish",
        label: "chain_finish",
      }),
    },
    additionalColumns: [
      getTableLinkColumnDef(
        "chains_log",
        "logs",
        "chains_log",
        "Подробнее",
        "instance_id"
      ),
    ],
  },

  chains_log: {
    primaryKeyColumn: "log_id",
    getRowId: getDefaultGetRowId("log_id"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("log_id"),
    shouldUseRowIndexAsRowKey: true,
    isEditable: false,
    columns: {
      log_id: getNumberColumnDef({
        columnName: "log_id",
        label: "log_id",
        isEditable: false,
      }),
      instance_id: getNumberColumnDef({
        columnName: "instance_id",
        label: "instance_id",
      }),
      log_timestamp: getTextColumnDef({
        columnName: "log_timestamp",
        label: "log_timestamp",
      }),
      log_type: getTextColumnDef({
        columnName: "log_type",
        label: "log_type",
      }),
      log_msg: getTextColumnDef({
        columnName: "log_msg",
        label: "log_msg",
      }),
    },
  },

  ext_tables_params: {
    primaryKeyColumn: "object_id",
    getRowId: getDefaultGetRowId("object_id"),
    getDeleteRowFieldsObject: getDefaultDeleteRowFieldsObject("object_id"),
    isEditable: true,
    newRowTemplate: {
      active: true,
    },
    columns: {
      object_id: getNumberColumnDef({
        columnName: "object_id",
        label: "object_id",
        isContextMenuVisible: true,
        isEditable: false,
      }),
      object_name: getTextColumnDef({
        columnName: "object_name",
        label: "Имя объекта",
      }),
      load_method: getSelectValueFromOtherTableColumn(
        COLUMNS_SELECT_INFO.load_method
      ),
      connection_string: getTextColumnDef({
        columnName: "connection_string",
        label: "connection_string",
      }),
      additional: getTextColumnDef({
        columnName: "additional",
        label: "additional",
      }),
      active: getBooleanColumnDef({
        columnName: "active",
        label: "active",
      }),
    },
  },
};
