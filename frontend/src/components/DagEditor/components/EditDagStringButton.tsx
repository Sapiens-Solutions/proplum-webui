import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useCallback, useState } from "react";

interface EditDagStringButtonProps {
  initialValue: string;
  onDagStringEdit: (dagString: string) => void;
}

export const EditDagStringButton: React.FC<EditDagStringButtonProps> = ({
  initialValue,
  onDagStringEdit,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dagString, setDagString] = useState<string>(initialValue);

  const onPopoverOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        // Update initial value of dag string
        setDagString(initialValue);
      }

      setIsPopoverOpen(open);
    },
    [initialValue]
  );

  const onApply = useCallback(() => {
    onDagStringEdit(dagString ?? "");

    setIsPopoverOpen(false);
  }, [dagString, onDagStringEdit]);

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onApply();
      }
    },
    [onApply]
  );

  const onDagStringInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDagString(event.target.value);
    },
    []
  );

  return (
    <Popover open={isPopoverOpen} onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Изменить строковое представление цепочки
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="z-[1000001]">
        <div className="flex flex-col gap-3 p-[0px]">
          <Input
            value={dagString}
            onChange={onDagStringInputChange}
            placeholder="Значение фильтра"
            className="w-full"
            onKeyDown={onInputKeyDown}
          />
          <Button onClick={onApply} className="mx-auto max-w-[200px]">
            Применить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
