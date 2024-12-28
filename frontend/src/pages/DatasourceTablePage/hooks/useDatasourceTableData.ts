import { useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/envs";
import { useTableStore } from "@/store/tableStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createErrorToast } from "@/utils/toast";

type ResponseData = {
  data: {
    columns: ColumnsResponseData;
    data: any[];
  };
};

type ColumnsResponseData = {
  column_name: string;
  data_type: string;
  comment?: string | undefined;
}[];

export const useDatasourceTableData = () => {
  const tableName = useTableStore((state) => state.tableName);
  const setTableColumnsAndData = useTableStore(
    (state) => state.setTableColumnsAndData
  );
  const setIsTableDataPending = useTableStore(
    (state) => state.setIsTableDataPending
  );
  const setIsTableDataPendingCurrently = useTableStore(
    (state) => state.setIsTableDataPendingCurrently
  );
  const setTableDataRequestError = useTableStore(
    (state) => state.setTableDataRequestError
  );
  const dataLoadTrigger = useTableStore((state) => state.dataLoadTrigger);

  const setIsTableDataPendingTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  const { isPending, error, data } = useQuery<ResponseData>({
    queryKey: ["datasourceData", tableName, dataLoadTrigger],
    queryFn: () =>
      axios.post(
        `${BACKEND_URL}/datasource/data?table_name=${tableName}&skip=0&limit=0`,
        {}
      ),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    staleTime: Infinity,
    enabled: !!tableName,
  });

  useEffect(() => {
    if (!data?.data) {
      return;
    }

    const tableData = data.data.data;
    const tableColumns = data.data.columns;
    const formattedTableColumns = tableColumns?.length
      ? tableColumns.map((column) => ({
          columnName: column.column_name,
          dataType: column.data_type,
          comment: column.comment,
        }))
      : [];

    setTableColumnsAndData(tableData, formattedTableColumns);
  }, [data, setTableColumnsAndData]);

  useEffect(() => {
    // Set immediate boolean value and then set boolean with timeout (used for different cases)
    setIsTableDataPendingCurrently(!!isPending);

    if (!isPending) {
      setIsTableDataPending(false);
      return;
    }

    // Set timeout with delay to show loading animations only for long data fetches
    setIsTableDataPendingTimeoutRef.current = setTimeout(
      () => setIsTableDataPending(true),
      200
    );

    return () => clearTimeout(setIsTableDataPendingTimeoutRef.current);
  }, [isPending, setIsTableDataPending, setIsTableDataPendingCurrently]);

  useEffect(() => {
    const responseErrorMessage =
      (error as any)?.response?.data?.detail ??
      error?.message ??
      (error ? "Неизвестная ошибка" : undefined);

    if (responseErrorMessage) {
      createErrorToast("Ошибка при загрузке данных таблицы");
    }

    setTableDataRequestError(responseErrorMessage);
  }, [error, setTableDataRequestError]);
};
