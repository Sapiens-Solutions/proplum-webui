import {
  saveEditedData as apiSaveEditedData,
  deleteRows as apiDeleteRows,
  getColumnValues as apiGetColumnValues,
} from "@/api";
import { SelectRowColumn } from "@/components/DatasourceTable/TablesInfo/Columns";
import {
  DatasourceColumnDef,
  TABLES_INFO,
} from "@/components/DatasourceTable/TablesInfo/TablesInfo";
import { MODAL_ANIMATION_DURATION_MS } from "@/components/DraggableResizableModal/DraggableResizableModal";
import { ALLOWED_COLUMN_VALIDATION_TYPES } from "@/const";
import { ColumnValidationType } from "@/types";
import { TEN_SECONDS_MS } from "@/utils/time";
import { createErrorToast, createPromiseToast } from "@/utils/toast";
import { withExactTypeCheck } from "@/utils/withExactTypeCheck";
import { RowPinningState } from "@tanstack/react-table";
import { create } from "zustand";

export type TableState = {
  /* 1) Table base data and functions */
  tableName?: string;
  tableColumns?: TableColumn[];
  columnDefs?: DatasourceColumnDef[];
  tableData: null | any[];
  tablePrimaryKeyColumn: string;
  newRowTemplate: Record<string, any>;
  columnsOrderMap: Record<string, number>;
  columnNameToLabel: Record<string, string>;
  columnNameToOrderNumber?: Record<string, number>;
  isTableEditable?: boolean;
  rowPinning: RowPinningState;
  autoResetPageIndex: boolean;
  shouldUseRowIndexAsRowKey: boolean;
  previousFetchedDataTableName?: string;
  setTableName: (tableName?: string) => void;
  setTableColumnsAndData: (
    tableData: null | any[],
    tableColumns: TableColumn[]
  ) => void;
  /** Function for getting ID of existing or newly added row */
  getRowId: (row: Record<string, any>) => string;
  /** Initial function for getting ID of existing row.
   * This func should be used only inside "getRowId" or "getRowState" functions
   * */
  originalTableGetRowId: (row: Record<string, any>) => string;
  getDeleteRowFieldsObject: (row: Record<string, any>) => Record<string, any>;
  getRowState: (row: Record<string, any>) => {
    rowId: string;
    isAddedRow: boolean;
    wasRecentlyDeleted: boolean;
    wasRecentlyUploaded: boolean;
  };

  getCellValue: (
    row: Record<string, any>,
    columnName: string
  ) => {
    value: any;
    isEdited: boolean;
    wasRecentlySaved: boolean;
    validationError?: string | null;
  };
  onSetRowPinning: React.Dispatch<React.SetStateAction<RowPinningState>>;

  /* 2) Table data load state */
  /** Shows if table data is pending but with small latency to not show some animations immediately */
  isTableDataPending?: boolean;
  /** Shows if table data is pending without latency to show animations that should be rendered immediately */
  isTableDataPendingCurrently?: boolean;
  /** Shows if table data was loaded at least one time */
  hasLoadedTableDataOnce: boolean;
  tableDataRequestError?: string;
  setIsTableDataPending: (isTableDataPending: boolean) => void;
  setIsTableDataPendingCurrently: (
    isTableDataPendingCurrently: boolean
  ) => void;
  setTableDataRequestError: (tableDataRequestError: string | undefined) => void;

  /* 3) Table editing data and functions */
  /* Primary key value -> row */
  editedRows: Record<string | number, Record<string, any>>;
  /* Generated row id -> row */
  addedRows: Record<string | number, Record<string, any>>;
  recentEdits: {
    editedRows: Record<string | number, Record<string, any>>;
    deletedRows: Record<string | number, true | undefined>;
    addedRows: Record<string | number, true | undefined>;
  };
  cachedColumnValues: { [columnName: string]: ColumnValuesCache };
  validationErrors: {
    [rowId: string]: { [columnName: string]: string | null | undefined };
  };
  updateRow: UpdateRowFunc;
  deleteRows: (
    rowsInfo: Array<{ data: Record<string, any>; tableIndexId?: string }>,
    onDelete?: () => void
  ) => void;
  addRows: (
    rowsInsertData: Array<{
      row?: Record<string, any>;
      parentRowIndex?: number;
    }>,
    shouldScrollToBottom?: boolean,
    onAdd?: () => void
  ) => void;
  /** Saves edited and added rows to DB */
  saveEditedData: () => Promise<void>;
  clearEditings: (onClear?: () => void) => void;
  /** Gets available values for 'currentTableColumnName' that is referring to 'referredTableName' in table 'referredTableName' */
  getColumnValues: (
    currentTableColumnName: string,
    referredTableName: string,
    referredValueColumnName: string,
    referredDescriptionColumnName?: string
  ) => Promise<ColumnValue[]>;
  /** Saves validation error to store */
  setValidationError: ({
    row,
    columnName,
    error,
  }: {
    row: Record<string, any>;
    columnName: string;
    error: string | null | undefined;
  }) => void;

  /* 4) Triggers for manually executing actions with table */
  dataLoadTrigger: boolean;
  cellsRerenderTrigger: boolean;
  rowsRerenderTrigger: boolean;
  scrollTableToBottomTrigger: boolean | undefined;
  refetchData: () => void;

  /* 5) Table modals data and functions */
  modals: ModalData[];
  modalsCloseTrigger?: boolean;
  shouldHideCloseModalsButton?: boolean;
  /** Creates modal and returns modal ID */
  addModal: ({
    content,
    label,
    key,
    startPosition,
  }: {
    content: ModalData["content"];
    contentProps: ModalData["contentProps"];
    label: string;
    key: string;
    startPosition?: ModalData["startPosition"];
  }) => string;
  addJsonModal: ({
    content,
    startPosition,
  }: {
    content: ModalData["content"];
    contentProps: ModalData["contentProps"];
    startPosition?: ModalData["startPosition"];
  }) => string;
  removeModal: (modalId: ModalData["id"]) => void;
  triggerModalsClose: () => void;
};

const ADDED_ROW_ID_FIELD_NAME = "__$id";

export type UpdateRowFunc = ({
  row,
  columnName,
  value,
}: {
  row: Record<string, any>;
  columnName: string;
  value: any;
}) => {
  isEdited: boolean;
};

export type ColumnValuesCache = {
  lastFetchTimestamp: number;
  data: ColumnValue[];
};

export type ColumnValue = {
  value: any;
  description?: string;
};

export type TableColumn = {
  columnName: string;
  dataType: string;
  comment?: string | null;
};

export type ModalData = {
  id: string;
  label: string;
  content: React.FC<any>;
  contentProps: any;
  startPosition: { x: number; y: number };
};

export const useTableStore = create<TableState>()(
  withExactTypeCheck((set, get) => ({
    tableName: undefined,
    setTableName: (tableName) => set({ tableName }),

    tableColumns: undefined,
    tableData: null,
    tablePrimaryKeyColumn: "",
    rowPinning: { top: [], bottom: [] },
    autoResetPageIndex: true,
    shouldUseRowIndexAsRowKey: false,
    columnNameToLabel: {},
    newRowTemplate: {},
    columnsOrderMap: {},
    editedRows: {},
    addedRows: {},
    recentEdits: {
      editedRows: {},
      deletedRows: {},
      addedRows: {},
    },
    previousFetchedDataTableName: undefined,
    cachedColumnValues: {},
    validationErrors: {},
    originalTableGetRowId: () => "",
    getDeleteRowFieldsObject: (row) => row,

    setTableColumnsAndData: (tableData, tableColumns) => {
      const { tableName, previousFetchedDataTableName, addedRows } = get();

      const tableInfo = tableName ? TABLES_INFO[tableName] : null;
      const isTableEditable = tableInfo?.isEditable ?? false;
      const primaryKeyColumn = tableInfo?.primaryKeyColumn ?? "";
      const shouldUseRowIndexAsRowKey =
        tableInfo?.shouldUseRowIndexAsRowKey ?? false;
      const newRowTemplate = tableInfo?.newRowTemplate ?? {};
      const originalTableGetRowId = tableInfo?.getRowId ?? (() => "");
      const getDeleteRowFieldsObject =
        tableInfo?.getDeleteRowFieldsObject ?? ((row) => row);
      const columnsOrderMap: Record<string, number> = {};

      const tableInfoColumns: Record<string, DatasourceColumnDef> =
        tableInfo?.columns ?? {};
      const mappedColumns: DatasourceColumnDef[] = [];
      if (tableColumns?.length && Object.keys(tableInfoColumns).length) {
        tableColumns.forEach((column, index) => {
          columnsOrderMap[column.columnName] = index;

          const columnDef: DatasourceColumnDef | undefined =
            tableInfoColumns[column.columnName];
          if (columnDef) {
            // Set comment for column received from backend
            columnDef.comment = column.comment;

            // Set column validation type (interval, cron, ...) received from backend
            const columnType = column.dataType as ColumnValidationType;
            if (columnType && ALLOWED_COLUMN_VALIDATION_TYPES[columnType]) {
              columnDef.validationType = columnType;
            }

            mappedColumns.push(columnDef);
          }
        });
      }

      const additionalColumns: DatasourceColumnDef[] =
        tableInfo?.additionalColumns ?? [];
      const additionalColumnsStartIndex: number =
        tableInfo?.additionalColumnsStartIndex ?? mappedColumns.length + 1;
      let mainAndAdditionalColumns: DatasourceColumnDef[];
      if (additionalColumns.length) {
        mainAndAdditionalColumns = [
          ...mappedColumns.slice(0, additionalColumnsStartIndex),
          ...additionalColumns,
          ...mappedColumns.slice(additionalColumnsStartIndex),
        ];
      } else {
        mainAndAdditionalColumns = mappedColumns;
      }

      const columnDefs: DatasourceColumnDef[] = [
        SelectRowColumn,
        ...mainAndAdditionalColumns,
      ];

      const columnNameToOrderNumber: Record<string, number> = {};
      const columnNameToLabel: Record<string, string> = {};
      for (let i = 1; i < columnDefs.length; i++) {
        const column = columnDefs[i];
        columnNameToLabel[column.accessorKey] = column.label;
        columnNameToOrderNumber[column.accessorKey] = i;
      }

      const hasTableChanged = previousFetchedDataTableName !== tableName;

      /* 
      If table hasn't changed since last fetch should add 
      newly added but not saved rows to tableData to keep them in table
      */
      const addedRowsArray = addedRows ? Object.values(addedRows) : [];
      const newTableData = tableData ?? [];
      if (!hasTableChanged && addedRowsArray.length > 0) {
        newTableData.push(...addedRowsArray);
      }

      const partlyClearTableStateFields = hasTableChanged
        ? {
            addedRows: {},
            editedRows: {},
            validationErrors: {},
            rowPinning: { top: [], bottom: [] },
          }
        : {};

      set(() => ({
        tableData: newTableData,
        tableColumns,
        columnDefs,
        columnNameToLabel,
        columnNameToOrderNumber,
        isTableEditable,
        tablePrimaryKeyColumn: primaryKeyColumn,
        shouldUseRowIndexAsRowKey,
        previousFetchedDataTableName: tableName,
        newRowTemplate,
        columnsOrderMap,
        originalTableGetRowId,
        getDeleteRowFieldsObject,
        hasLoadedTableDataOnce: true,
        cachedColumnValues: {},
        ...partlyClearTableStateFields,
      }));
    },

    onSetRowPinning: (updaterOrValue) => {
      const { rowPinning } = get();

      let newRowPinning: RowPinningState;
      if (typeof updaterOrValue === "function") {
        newRowPinning = updaterOrValue(rowPinning);
      } else {
        newRowPinning = updaterOrValue;
      }

      set({ rowPinning: newRowPinning });
    },

    updateRow: ({ row, columnName, value }) => {
      const { tablePrimaryKeyColumn, editedRows, addedRows, getRowState } =
        get();

      if (!tablePrimaryKeyColumn)
        return { isEdited: false, validationError: undefined };

      const { rowId, isAddedRow } = getRowState(row);
      let isEdited: boolean;
      if (isAddedRow) {
        // Updating added row
        const rowData = addedRows[rowId];
        if (!rowData) return { isEdited: false, validationError: undefined };

        rowData[columnName] = value;

        set({ addedRows: { ...addedRows } });

        isEdited = true;
      } else {
        // Updating existing row
        const editedRowData = editedRows[rowId] ?? {};
        const initialCellValue = row[columnName];

        const shouldUseJsonCompare = typeof value === "object";
        const isCellEdited = shouldUseJsonCompare
          ? JSON.stringify(initialCellValue) !== JSON.stringify(value)
          : initialCellValue !== value;

        if (isCellEdited) {
          // Update edited field
          editedRowData[columnName] = value;
        } else {
          // Remove edited field
          delete editedRowData[columnName];
        }

        const newEditedRows: Record<string | number, Record<string, any>> = {
          ...editedRows,
        };
        if (Object.keys(editedRowData).length === 0) {
          delete newEditedRows[rowId];
        } else {
          newEditedRows[rowId] = editedRowData;
        }

        set(() => ({
          editedRows: newEditedRows,
        }));

        isEdited = isCellEdited;
      }

      return { isEdited };
    },

    addRows: (
      rowsInsertData,
      shouldScrollToBottom = false,
      onAdd = () => {}
    ) => {
      if (!rowsInsertData?.length) return;

      const { addedRows, rowPinning, tableData, newRowTemplate } = get();
      const newAddedRows = { ...addedRows };
      const newRowPinning = { ...rowPinning };
      let newTableData = [...(tableData ?? [])];

      // Maps parent row index to array of it's subrows
      const subrowsMap: Record<
        string | number,
        Array<Record<string, any>>
      > = {};

      rowsInsertData.forEach((insertData) => {
        const initializedRow: Record<string, any> = insertData.row
          ? insertData.row
          : JSON.parse(JSON.stringify(newRowTemplate));

        // Generate row ID
        const rowId: string = generateUniqueRowId(addedRows);
        initializedRow[ADDED_ROW_ID_FIELD_NAME] = rowId;
        newAddedRows[rowId] = initializedRow;

        const parentRowIndex: number | undefined = insertData.parentRowIndex;

        if (parentRowIndex === undefined) {
          // If row doesn't have parent, push it to the end of table data array and pin it to be always visible at bottom
          newTableData.push(initializedRow);
          newRowPinning.bottom?.push(rowId);
          return;
        }

        // If row has parent, add it to subrows map
        if (!subrowsMap[parentRowIndex]) {
          subrowsMap[parentRowIndex] = [];
        }
        subrowsMap[parentRowIndex].push(initializedRow);
      });

      // Walk through table rows and add new subrows
      newTableData = newTableData.flatMap((row, rowIndex) => {
        const subrows = subrowsMap[rowIndex];
        if (!subrows?.length) return row;

        return [row, ...subrows];
      });

      set({
        addedRows: newAddedRows,
        tableData: newTableData,
        rowPinning: newRowPinning,
      });

      if (shouldScrollToBottom) {
        set((prevState) => ({
          scrollTableToBottomTrigger: !prevState.scrollTableToBottomTrigger,
        }));
      }

      onAdd?.();
    },

    deleteRows: async (rowsInfo, onDelete) => {
      const {
        getRowState,
        getDeleteRowFieldsObject,
        tableName,
        addedRows,
        editedRows,
        rowPinning,
        validationErrors,
      } = get();

      if (!rowsInfo?.length || !tableName) return;

      const newAddedRows = { ...addedRows };
      const newEditedRows = { ...editedRows };
      const newValidationErrors = { ...validationErrors };

      const deletedRowsValues: Array<Record<string, any>> = [];
      const deletedRowsPrimaryKeyValues: (string | number)[] = [];
      const deletedAddedRowsPrimaryKeyValues: (string | number)[] = [];
      const deletedRowsTableIndexesMap: Record<string, true | undefined> = {};

      rowsInfo.forEach((rowInfo) => {
        const rowData = rowInfo.data;

        const { rowId, isAddedRow } = getRowState(rowData);
        if (!rowId) return;

        if (isAddedRow) {
          delete newAddedRows[rowId];
          deletedAddedRowsPrimaryKeyValues.push(rowId);
        } else {
          delete newEditedRows[rowId];
          deletedRowsPrimaryKeyValues.push(rowId);
          deletedRowsValues.push(getDeleteRowFieldsObject(rowData));
        }
        delete newValidationErrors[rowId];

        // Row table index may differ from row ID
        const rowTableIndex: string = rowInfo.tableIndexId ?? rowId;
        deletedRowsTableIndexesMap[rowTableIndex] = true;
      });

      // Unpin added rows from bottom
      const newRowPinning = { ...rowPinning };
      newRowPinning.bottom =
        newRowPinning.bottom?.filter(
          (rowId) => !deletedRowsTableIndexesMap[rowId]
        ) ?? [];

      let deleteRowsPromise: Promise<any>;
      if (deletedRowsPrimaryKeyValues.length > 0) {
        deleteRowsPromise = apiDeleteRows({
          tableName,
          deletedRows: deletedRowsValues,
        });
        createPromiseToast(
          deleteRowsPromise,
          "Удаляем данные...",
          "Данные удалены",
          "Ошибка при удалении данных"
        );
      } else {
        deleteRowsPromise = new Promise((resolve) => {
          resolve(true);
        });
      }

      deleteRowsPromise
        .then(() => {
          onDelete?.();

          const deletedExistingRowsMap: Record<string | number, true> = {};
          const deletedAddedRowsMap: Record<string | number, true> = {};

          deletedRowsPrimaryKeyValues.forEach((value) => {
            deletedExistingRowsMap[value] = true;
          });
          deletedAddedRowsPrimaryKeyValues.forEach((value) => {
            deletedAddedRowsMap[value] = true;
          });

          // Set recent edits and clear it after some time when all edit animations are played
          set({
            recentEdits: {
              editedRows: {},
              deletedRows: {
                ...deletedExistingRowsMap,
                ...deletedAddedRowsMap,
              },
              addedRows: {},
            },
          });

          setTimeout(() => {
            set((prevState) => ({
              recentEdits: {
                editedRows: {},
                deletedRows: {},
                addedRows: {},
              },
              tableData: prevState.tableData?.filter((row) => {
                const rowId: string = getRowState(row).rowId;
                return (
                  !deletedExistingRowsMap[rowId] && !deletedAddedRowsMap[rowId]
                );
              }),
              editedRows: newEditedRows,
              addedRows: newAddedRows,
              rowPinning: newRowPinning,
              validationErrors: newValidationErrors,
            }));
          }, 500);

          set((prevState) => ({
            rowsRerenderTrigger: !prevState.rowsRerenderTrigger,
          }));
        })
        .catch(() => {});
    },

    getCellValue: (row, columnName) => {
      const { editedRows, recentEdits, getRowId, validationErrors } = get();

      const rowId = getRowId(row);
      const initialCellValue = row[columnName];

      if (!rowId)
        return {
          value: initialCellValue,
          isEdited: false,
          wasRecentlySaved: false,
          isDeletedRow: false,
          isAddedRow: false,
        };

      const editedRowData = editedRows[rowId] ?? {};
      const editedValue = editedRowData[columnName];
      const isValueEdited = editedValue !== undefined;

      // Ignore validation error if cell wasn't edited by user
      const validationError = isValueEdited
        ? validationErrors[rowId]?.[columnName]
        : undefined;

      const cellValue = isValueEdited ? editedValue : initialCellValue;

      let wasRecentlySaved: boolean;
      const recentEditedRowData: Record<string, any> | undefined =
        recentEdits.editedRows[rowId];
      if (recentEditedRowData !== undefined) {
        wasRecentlySaved = recentEditedRowData[columnName] !== undefined;
        delete recentEditedRowData[columnName];
      } else {
        wasRecentlySaved = false;
      }

      return {
        value: cellValue,
        isEdited: isValueEdited,
        wasRecentlySaved,
        validationError,
      };
    },

    getRowState: (row) => {
      if (!row) {
        return {
          rowId: "",
          isAddedRow: false,
          wasRecentlyDeleted: false,
          wasRecentlyUploaded: false,
        };
      }

      const { recentEdits, originalTableGetRowId } = get();

      let rowId: string;
      let isAddedRow: boolean;

      const addedRowId: string | undefined = row[ADDED_ROW_ID_FIELD_NAME];
      if (addedRowId) {
        rowId = String(addedRowId);
        isAddedRow = true;
      } else {
        rowId = originalTableGetRowId(row);
        isAddedRow = false;
      }

      const wasRecentlyDeleted: boolean = !!recentEdits.deletedRows[rowId];
      const wasRecentlyUploaded: boolean = !!recentEdits.addedRows[rowId];

      return {
        rowId,
        isAddedRow,
        wasRecentlyDeleted,
        wasRecentlyUploaded,
      };
    },

    getRowId: (row) => {
      const getRowState = get().getRowState;

      return getRowState(row).rowId;
    },

    isTableDataPending: undefined,
    setIsTableDataPending: (isTableDataPending) =>
      set(() => ({ isTableDataPending })),

    isTableDataPendingCurrently: undefined,
    setIsTableDataPendingCurrently: (isTableDataPendingCurrently) =>
      set(() => ({ isTableDataPendingCurrently })),

    hasLoadedTableDataOnce: false,

    setTableDataRequestError: (tableDataRequestError) =>
      set(() => ({ tableDataRequestError })),

    saveEditedData: async () => {
      const {
        tableName,
        tablePrimaryKeyColumn,
        editedRows,
        addedRows,
        tableData,
        getRowId,
      } = get();
      if (!tableName || !tablePrimaryKeyColumn) return;

      const newRows: Array<Record<string, any>> = [];
      const addedRowsArray = Object.values(addedRows);
      for (let i = 0; i < addedRowsArray.length; i++) {
        const row = addedRowsArray[i];

        if (Object.keys(row).length <= 1) {
          createErrorToast("Заполните пустые строки");
          return;
        }

        newRows.push({
          ...row,
          [ADDED_ROW_ID_FIELD_NAME]: undefined,
        });
      }

      const saveDataPromise = apiSaveEditedData({
        tableName,
        primaryKeyColumn: tablePrimaryKeyColumn,
        editedRows,
        newRows,
      });

      createPromiseToast(
        saveDataPromise,
        "Сохраняем данные...",
        "Данные сохранены",
        "Ошибка при сохранении данных"
      );

      saveDataPromise
        .then(() => {
          // Apply edits to rows
          tableData?.forEach((row) => {
            const rowPrimaryColumnValue = row[tablePrimaryKeyColumn];
            const editedRow = editedRows[rowPrimaryColumnValue];
            if (!editedRow) return;

            Object.entries(editedRow).forEach(([columnName, editedValue]) => {
              row[columnName] = editedValue;
            });
          });

          const recentlyAddedRows = Object.values(addedRows).reduce<
            Record<string | number, true | undefined>
          >((acc, row) => {
            const rowId = getRowId({
              ...row,
              [ADDED_ROW_ID_FIELD_NAME]: undefined,
            });
            acc[rowId] = true;
            return acc;
          }, {});

          // Set recent edits and clear it after some time when all edit animations are played
          set((prevState) => ({
            editedRows: {},
            addedRows: {},
            validationErrors: {},
            recentEdits: {
              editedRows: editedRows,
              deletedRows: {},
              addedRows: recentlyAddedRows,
            },
            rowsRerenderTrigger: !prevState.rowsRerenderTrigger,
            cellsRerenderTrigger: !prevState.cellsRerenderTrigger,
          }));

          const newTableData = (tableData ?? []).map((row) => {
            delete row[ADDED_ROW_ID_FIELD_NAME];
            return row;
          });

          const newRowPinning: RowPinningState = { top: [], bottom: [] };

          setTimeout(() => {
            set(() => ({
              editedRows: {},
              addedRows: {},
              recentEdits: {
                editedRows: {},
                deletedRows: {},
                addedRows: {},
              },
              rowPinning: newRowPinning,
              tableData: newTableData,
            }));
          }, 500);
        })
        .catch(() => {});
    },

    clearEditings: (onClear) => {
      const { deleteRows, addedRows } = get();

      // Delete newly added rows
      deleteRows(
        Object.values(addedRows).map((row) => ({
          data: row,
          tableIndexId: undefined,
        }))
      );

      // Clear edits to existings rows and trigger rerendering
      set((prevState) => ({
        editedRows: {},
        validationErrors: {},
        cellsRerenderTrigger: !prevState.cellsRerenderTrigger,
      }));

      onClear?.();
    },

    getColumnValues: async (
      currentTableColumnName,
      referredTableName,
      referredValueColumnName,
      referredDescriptionColumnName
    ) => {
      const { cachedColumnValues } = get();

      // If column values were already cached less than 10 seconds ago, get them from map and return
      const cachedValues = cachedColumnValues[currentTableColumnName];
      const lastFetchTimestamp = cachedValues?.lastFetchTimestamp;
      if (
        lastFetchTimestamp &&
        Date.now() < lastFetchTimestamp + TEN_SECONDS_MS
      )
        return cachedValues.data;

      // Column values weren't cached yet or were cached some time ago, make request to backend and save them to cache
      return new Promise((resolve) => {
        apiGetColumnValues({
          tableName: referredTableName,
          valueColumnName: referredValueColumnName,
          descriptionColumnName: referredDescriptionColumnName,
        })
          .then((values) => {
            cachedColumnValues[currentTableColumnName] = {
              lastFetchTimestamp: Date.now(),
              data: values,
            };
            resolve(values);
          })
          .catch((error) => {
            console.error(error);
            createErrorToast(
              `Не удалось получить допустимые значения для колонки ${currentTableColumnName}`
            );
            resolve([]);
          });
      });
    },

    setValidationError: ({ row, columnName, error }) => {
      const { validationErrors, getRowId } = get();
      const newValidationErrors = { ...validationErrors };

      const rowId = getRowId(row);
      if (!newValidationErrors[rowId]) {
        newValidationErrors[rowId] = {};
      }

      newValidationErrors[rowId][columnName] = error;

      set({ validationErrors: newValidationErrors });
    },

    dataLoadTrigger: false,
    cellsRerenderTrigger: false,
    rowsRerenderTrigger: false,
    scrollTableToBottomTrigger: undefined,

    refetchData: () => {
      set((prevState) => ({ dataLoadTrigger: !prevState.dataLoadTrigger }));
    },

    modals: [],
    addModal: ({
      content,
      contentProps,
      label,
      key,
      startPosition = { x: 10, y: 10 },
    }) => {
      const newModal: ModalData = {
        id: `${key}-${Date.now()}`,
        content,
        contentProps,
        label,
        startPosition,
      };
      set((prevState) => ({ modals: [...prevState.modals, newModal] }));
      return newModal.id;
    },
    removeModal: (modalId) => {
      set((prevState) => ({
        modals: prevState.modals.filter((modal) => modal.id !== modalId),
      }));
    },
    triggerModalsClose: () => {
      set((prevState) => ({
        modalsCloseTrigger: !prevState.modalsCloseTrigger,
        shouldHideCloseModalsButton: true,
      }));
      setTimeout(() => set(() => ({ modalsCloseTrigger: undefined })), 100);
      setTimeout(
        () => set(() => ({ shouldHideCloseModalsButton: false })),
        1000 + MODAL_ANIMATION_DURATION_MS
      );
    },
    addJsonModal: ({ content, contentProps, startPosition }) => {
      const modalId = get().addModal({
        content,
        contentProps,
        label: "JSON",
        key: "json",
        startPosition,
      });

      return modalId;
    },
  }))
);

function generateUniqueRowId(existingRowsMap: Record<string, any>): string {
  let rowId: string;
  let i = 0;
  do {
    rowId = generateRowId();
    i++;
  } while (!existingRowsMap[rowId] && i < 5);

  if (!rowId) {
    rowId = "-";
  }

  return rowId;
}

function generateRowId(): string {
  return Date.now() + Math.random().toFixed(3);
}
