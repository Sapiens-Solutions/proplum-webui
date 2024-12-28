import { cn } from "@/lib/utils";
import React from "react";
import toast, { Toast, Toaster, resolveValue } from "react-hot-toast";

export type ToastExtended = Toast & { placeCloseInAbsolute?: boolean };

export const CustomToaster: React.FC = () => (
  <Toaster position="top-right">
    {(t: ToastExtended) => (
      <div
        key={t.id}
        className={cn(
          "relative flex min-h-[30px] min-w-[220px] items-center rounded-[5px] bg-white p-[5px] text-primary shadow-lg ring-1 ring-black ring-opacity-5",
          t.icon && "pl-[10px]",
          t.type === "error" && "min-w-[300px]"
        )}
        style={{
          animation:
            t.visible && t.type === "error"
              ? "error-toast-enter 0.3s ease-out forwards"
              : t.visible
                ? `toast-enter 0.2s ease-out forwards`
                : `toast-exit 0.4s ease-in forwards`,
        }}
      >
        {t.icon}
        <div
          className="flex-[1] px-[8px] py-[6px] text-left"
          style={t.style ?? {}}
        >
          {resolveValue(t.message, t)}
        </div>
        {t.type !== "loading" && (
          <button
            className={`${t.placeCloseInAbsolute ? "absolute right-[5px] top-[5px]" : ""} flex h-[16px] w-[16px] items-center justify-center border-none bg-transparent p-[12px] text-[24px] text-gray-600 hover:text-gray-500`}
            onClick={() => toast.dismiss(t.id)}
          >
            &#215;
          </button>
        )}
      </div>
    )}
  </Toaster>
);
