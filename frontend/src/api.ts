import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "./envs";
import { ColumnValue } from "./store/tableStore";
import { createErrorToast } from "./utils/toast";
import { parseAxiosErrorMessage } from "./utils/common";
import { ColumnValidationType, DagObject } from "./types";

type AxiosResponse = [data?: any, error?: string];

type SaveEditedDataRequest = {
  table_name: string;
  primary_key_column: string;
  edited_rows: Record<string | number, Record<string, any>>;
  new_rows: Array<Record<string, any>>;
};

export const saveEditedData = async ({
  tableName,
  primaryKeyColumn,
  editedRows = {},
  newRows = [],
}: {
  tableName: string;
  primaryKeyColumn: string;
  editedRows?: Record<string | number, Record<string, any>>;
  newRows?: Array<Record<string, any>>;
}): Promise<AxiosResponse> => {
  const requestBody: SaveEditedDataRequest = {
    table_name: tableName,
    primary_key_column: primaryKeyColumn,
    edited_rows: editedRows,
    new_rows: newRows,
  };
  return axios.post(`${BACKEND_URL}/datasource/data/write`, requestBody);
};

type DeleteRowsRequest = {
  table_name: string;
  deleted_rows: Array<Record<string, any>>;
};

export const deleteRows = async ({
  tableName,
  deletedRows,
}: {
  tableName: string;
  deletedRows: Array<Record<string, any>>;
}): Promise<AxiosResponse> => {
  const requestBody: DeleteRowsRequest = {
    table_name: tableName,
    deleted_rows: deletedRows,
  };
  return axios.delete(`${BACKEND_URL}/datasource/data`, {
    data: requestBody,
  });
};

export const getColumnValues = async ({
  tableName,
  valueColumnName,
  descriptionColumnName,
}: {
  tableName: string;
  valueColumnName: string;
  descriptionColumnName?: string;
}): Promise<ColumnValue[]> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/datasource_columns/values` +
        `?table_name=${tableName}` +
        `&value_column_name=${valueColumnName}` +
        (descriptionColumnName
          ? `&description_column_name=${descriptionColumnName}`
          : "")
    );

    return response?.data?.values ?? [];
  } catch (error) {
    createErrorToast(
      `Не удалось получить допустимые значения для колонки ${valueColumnName}`
    );
    return [];
  }
};

type GenerateLoadInfoRequest = {
  object_id: number;
  start_extr?: string;
  end_extr?: string;
  extraction_type?: string;
  load_type?: string;
  delta_mode?: string;
  load_interval?: string;
  start_load?: string;
  end_load?: string;
};

// Returns ID of generated load
export const generateLoadId = async ({
  objectId,
  startExtr,
  endExtr,
  extractionType,
  loadType,
  deltaMode,
  loadInterval,
  startLoad,
  endLoad,
}: {
  objectId: number;
  startExtr?: string;
  endExtr?: string;
  extractionType?: string;
  loadType?: string;
  deltaMode?: string;
  loadInterval?: string;
  startLoad?: string;
  endLoad?: string;
}): Promise<[number | null, string | undefined]> => {
  try {
    const requestBody: GenerateLoadInfoRequest = {
      object_id: objectId,
      start_extr: startExtr,
      end_extr: endExtr,
      extraction_type: extractionType,
      load_type: loadType,
      delta_mode: deltaMode,
      load_interval: loadInterval,
      start_load: startLoad,
      end_load: endLoad,
    };
    const response = await axios.post(
      `${BACKEND_URL}/load_info/generate`,
      requestBody
    );

    return [response?.data?.load_info_id ?? null, undefined];
  } catch (error) {
    const parsedErrorMessage = parseAxiosErrorMessage(
      error as AxiosError,
      "Не удалось сгенерировать load_id"
    );
    return [null, parsedErrorMessage];
  }
};

type ValidateValueRequest = {
  value: any;
  type: ColumnValidationType;
};

type ValidateValueResponse = {
  error: string | null;
};

// Validates value and returns error message or null
export const validate = async ({
  value,
  type,
}: ValidateValueRequest): Promise<string | null> => {
  try {
    const requestBody: ValidateValueRequest = {
      value,
      type,
    };
    const response = await axios.post<ValidateValueResponse>(
      `${BACKEND_URL}/validation/validate`,
      requestBody
    );

    const error = response?.data?.error || null;

    return error;
  } catch (error) {
    createErrorToast(`Не удалось проверить значение ${value} (${type})`);
    return null;
  }
};

type DagObjectsResponse = {
  data: Array<
    {
      object_id: number;
      object_name?: string | null;
      object_desc?: string | null;
    } & Record<string, any>
  >;
};

export const getDagObjects = async (): Promise<
  [DagObject[], string | undefined]
> => {
  try {
    const response = await axios.post<DagObjectsResponse>(
      `${BACKEND_URL}/datasource/data?table_name=objects&skip=0&limit=0`,
      {
        order_by: { object_id: "ASC" },
      }
    );

    const dagObjects: DagObject[] = response.data.data?.map((object) => ({
      id: object.object_id,
      name: object.object_name ?? undefined,
      description: object.object_desc ?? undefined,
    }));

    return [dagObjects, undefined];
  } catch (error) {
    const parsedErrorMessage = parseAxiosErrorMessage(
      error as AxiosError,
      "Не удалось получить информация о DAG-объектах"
    );
    createErrorToast(parsedErrorMessage);

    return [[], parsedErrorMessage];
  }
};
