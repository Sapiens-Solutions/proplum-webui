import React, { useCallback, useMemo, useState } from "react";
import styles from "./Cells.module.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { generateLoadId as apiGenerateLoadId } from "@/api";
import { Loader } from "@/components/Loader/Loader";
import {
  SelectFromColumnValues,
  SelectFromColumnValuesProps,
} from "@/components/SelectFromColumnValues/SelectFromColumnValues";
import { COLUMNS_SELECT_INFO } from "../TablesInfo/TablesInfo";
import { ColumnValue } from "@/store/tableStore";
import { BaseCellProps } from "./types";

type GenerateLoadIdButtonCellProps = Pick<BaseCellProps, "row" | "isAddedRow">;

export const GenerateLoadIdButtonCell: React.FC<
  GenerateLoadIdButtonCellProps
> = ({ row, isAddedRow = false }) => {
  const rowObjectId = row.getValue("object_id") as number;

  const {
    onGenerate,
    clearGeneratedLoadId,
    isGenerating,
    generatedLoadId,
    generateError,
    startExtrInputProps,
    endExtrInputProps,
    extractionTypeSelectProps,
    loadTypeSelectProps,
    deltaModeSelectProps,
    loadIntervalInputProps,
    startLoadInputProps,
    endLoadInputProps,
  } = useGenerateLoadIdForm({ objectId: rowObjectId });

  const onDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        clearGeneratedLoadId();
      }
    },
    [clearGeneratedLoadId]
  );

  return isAddedRow || typeof rowObjectId === "undefined" ? (
    // Use empty button to make cell tabbable
    <button className={cn(styles.emptyButtonCell, "ml-[10px]")} />
  ) : (
    <Dialog onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-[10px] focus-visible:border-blue-400"
        >
          Сгенерировать load_id
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] md:max-w-[600px]"
        tabIndex={undefined}
      >
        <DialogHeader>
          <DialogTitle>Генерация load_id</DialogTitle>
          <DialogDescription>
            Заполните параметры. Все поля, кроме object_id, являются
            необязательными. Незаполненные поля возьмут значения из выбранного
            object'а.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-[8px] py-1">
          <div className="col-span-2">
            <InputWrapper
              id="object_id"
              value={rowObjectId}
              disabled
              className="disabled:opacity-100"
            />
          </div>
          <InputWrapper
            {...startExtrInputProps}
            placeholder="2021-01-01T00:00:00"
          />
          <InputWrapper
            {...endExtrInputProps}
            placeholder="2021-01-01T00:00:00"
          />
          <SelectWrapper
            {...extractionTypeSelectProps}
            placeholder="EXTRACTION_TYPE"
          />
          <SelectWrapper {...loadTypeSelectProps} placeholder="LOAD_TYPE" />
          <SelectWrapper {...deltaModeSelectProps} placeholder="DELTA_MODE" />
          <InputWrapper {...loadIntervalInputProps} placeholder="1 day" />
          <InputWrapper
            {...startLoadInputProps}
            placeholder="2021-01-01T00:00:00"
          />
          <InputWrapper
            {...endLoadInputProps}
            placeholder="2021-01-01T00:00:00"
          />
        </div>
        <DialogFooter className="!flex-col items-center !justify-center gap-y-[12px]">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-[135px]"
          >
            {isGenerating ? (
              <Loader
                color="transparent"
                secondaryColor="#fff"
                containerClassName="w-[20px] h-[20px]"
              />
            ) : (
              "Сгенерировать"
            )}
          </Button>
          {generateError ? (
            <div className="text-red-500">{generateError}</div>
          ) : null}
          {generatedLoadId !== undefined ? (
            <div>
              Сгенерированный load_id:{" "}
              <span className="font-bold">
                {generatedLoadId === null ? "null" : generatedLoadId}
              </span>
            </div>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface InputWrapperProps {
  id: string;
  onChange?: (value: string) => void;
  value?: string | number;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  tabIndex?: number;
}

function InputWrapper({
  id,
  onChange,
  error,
  value,
  disabled,
  placeholder,
  className,
  tabIndex,
}: InputWrapperProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <Label htmlFor={id}>{id}</Label>
      <div className="relative pb-[10px]">
        <Input
          id={id}
          error={error}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value ?? "")}
          className={cn(
            error && "bg-red-100 text-red-700",
            "h-[38px]",
            className
          )}
          placeholder={placeholder}
          tabIndex={tabIndex}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

interface UseInputProps {
  id: string;
  initialValue?: any;
}

function useInput({ id, initialValue }: UseInputProps) {
  const [inputValue, setInputValue] = useState(initialValue ?? "");

  const onChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  return { value: inputValue, error: "", onChange, id };
}

type SelectWrapperProps = SelectFromColumnValuesProps & {
  label: string;
  placeholder?: string;
  tabIndex?: number;
};

function SelectWrapper({
  label,
  placeholder,
  tabIndex,
  ...selectProps
}: SelectWrapperProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <Label>{label}</Label>
      <div className="relative pb-[10px]">
        <SelectFromColumnValues
          menuPosition="absolute"
          placeholder={placeholder}
          styles={{}}
          selectClassNames={{
            control: () =>
              "!border !border-input !shadow-none !bg-background !text-sm !rounded-[6px]",
          }}
          tabIndex={tabIndex}
          {...selectProps}
        />
      </div>
    </div>
  );
}

interface UseSelectProps {
  columnName: keyof typeof COLUMNS_SELECT_INFO;
}

function useSelect({ columnName }: UseSelectProps) {
  const [selectValue, setSelectValue] = useState<ColumnValue | null>(null);

  const selectInfo = useMemo(
    () => COLUMNS_SELECT_INFO[columnName],
    [columnName]
  );

  const onChange = useCallback((value: ColumnValue | null) => {
    setSelectValue(value);
  }, []);

  return { ...selectInfo, value: selectValue, onChange };
}

interface UseGenerateLoadIdFormProps {
  objectId: number;
}

function useGenerateLoadIdForm({ objectId }: UseGenerateLoadIdFormProps) {
  const startExtrInputProps = useInput({ id: "start_extr" });
  const endExtrInputProps = useInput({ id: "end_extr" });
  const extractionTypeSelectProps = useSelect({
    columnName: "extraction_type",
  });
  const loadTypeSelectProps = useSelect({
    columnName: "load_type",
  });
  const deltaModeSelectProps = useSelect({
    columnName: "delta_mode",
  });
  const loadIntervalInputProps = useInput({ id: "load_interval" });
  const startLoadInputProps = useInput({ id: "start_load" });
  const endLoadInputProps = useInput({ id: "end_load" });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedLoadId, setGeneratedLoadId] = useState<
    number | null | undefined
  >();
  const [generateError, setGenerateError] = useState<string | undefined>();

  const clearGeneratedLoadId = useCallback(() => {
    setGeneratedLoadId(undefined);
  }, []);

  const clearForm = useCallback(() => {
    startExtrInputProps.onChange("");
    endExtrInputProps.onChange("");
    extractionTypeSelectProps.onChange(null);
    loadTypeSelectProps.onChange(null);
    deltaModeSelectProps.onChange(null);
    loadIntervalInputProps.onChange("");
    startLoadInputProps.onChange("");
    endLoadInputProps.onChange("");
  }, [
    deltaModeSelectProps,
    endExtrInputProps,
    endLoadInputProps,
    extractionTypeSelectProps,
    loadIntervalInputProps,
    loadTypeSelectProps,
    startExtrInputProps,
    startLoadInputProps,
  ]);

  const onGenerate = useCallback(async () => {
    setGenerateError(undefined);

    const startExtr = startExtrInputProps.value || undefined;
    const endExtr = endExtrInputProps.value || undefined;
    const extractionType = extractionTypeSelectProps.value?.value || undefined;
    const loadType = loadTypeSelectProps.value?.value || undefined;
    const deltaMode = deltaModeSelectProps.value?.value || undefined;
    const loadInterval = loadIntervalInputProps.value || undefined;
    const startLoad = startLoadInputProps.value || undefined;
    const endLoad = endLoadInputProps.value || undefined;

    setIsGenerating(true);
    const [loadId, error] = await apiGenerateLoadId({
      objectId,
      startExtr,
      endExtr,
      extractionType,
      loadType,
      deltaMode,
      loadInterval,
      startLoad,
      endLoad,
    });
    setIsGenerating(false);

    if (!error) {
      setGeneratedLoadId(loadId);
      clearForm();
      setGenerateError(undefined);
    } else {
      setGenerateError(error);
    }
  }, [
    objectId,
    startExtrInputProps.value,
    endExtrInputProps.value,
    extractionTypeSelectProps.value,
    loadTypeSelectProps.value,
    deltaModeSelectProps.value,
    loadIntervalInputProps.value,
    startLoadInputProps.value,
    endLoadInputProps.value,
    clearForm,
  ]);

  return {
    onGenerate,
    clearForm,
    clearGeneratedLoadId,
    isGenerating,
    generatedLoadId,
    generateError,
    startExtrInputProps,
    endExtrInputProps,
    extractionTypeSelectProps,
    loadTypeSelectProps,
    deltaModeSelectProps,
    loadIntervalInputProps,
    startLoadInputProps,
    endLoadInputProps,
  };
}
