import React, { useCallback, useEffect, useRef, useState } from "react";
import { Content, JSONEditor, Mode, toJSONContent } from "vanilla-jsoneditor";
import "./JsonViewer.css";
import { createErrorToast } from "@/utils/toast";
import { Button } from "../ui/button";

export const JSON_VIEWER_WIDTH = 400;
export const JSON_VIEWER_HEIGHT = 350;

const JSON_VIEWER_CLASS_NAME = "h-[350px] w-[400px]";

interface JsonViewerProps {
  value: Record<string, any>;
  onSave?: (json: any) => void;
  onClose?: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  value,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState<Content>({
    json: value ?? null,
    text: undefined,
  });

  const refContainer = useRef<HTMLDivElement | null>(null);
  const refEditor = useRef<JSONEditor | null>(null);

  useEffect(() => {
    // Create editor
    refEditor.current = new JSONEditor({
      target: refContainer.current as Element,
      props: {},
    });

    return () => {
      // Destroy editor
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps({
        content,
        onChange: setContent,
        askToFormat: false,
        mode: Mode.text,
        navigationBar: false,
        statusBar: false,
      });
    }
  }, [content]);

  const onSaveInner = useCallback(() => {
    if (!onSave) return undefined;

    const editor = refEditor.current;
    if (!editor) return;

    try {
      const editorContent = editor.get();
      const json = toJSONContent(editorContent).json;
      onSave(json);
      onClose?.();
    } catch {
      createErrorToast("Не удалось преобразовать в JSON");
    }
  }, [onSave, onClose]);

  return (
    <>
      <div className={JSON_VIEWER_CLASS_NAME} ref={refContainer} />
      <div className="absolute left-[50%] my-[5px] flex h-10 translate-x-[-50%] items-center justify-center gap-[15px]">
        {onSaveInner ? (
          <Button
            className="px-[10px] py-[6px]"
            onClick={onSaveInner}
            size="sm"
          >
            Сохранить
          </Button>
        ) : null}
      </div>
    </>
  );
};
