import { useDebouncedEffect } from "@/hooks/useDebouncedEffect";
import { useTableStore } from "@/store/tableStore";
import { useParams } from "react-router-dom";

export const useParamsData = () => {
  const { tableName } = useParams();

  const setTableName = useTableStore((state) => state.setTableName);

  useDebouncedEffect(
    () => {
      setTableName(tableName);
    },
    [tableName, setTableName],
    10
  );
};
