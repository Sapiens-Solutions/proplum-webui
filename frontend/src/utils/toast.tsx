import { AxiosError } from "axios";
import toast, { LoaderIcon, CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { parseAxiosErrorMessage } from "./common";

const SUCCESS_TOAST_DURATION_MS = 1000;
const ERROR_TOAST_DURATION_MS = 10000;

function createToast(
  type: "success" | "error",
  title: string,
  duration?: number
) {
  const toastFunction = type === "error" ? toast.error : toast.success;

  toastFunction(title, {
    duration:
      duration ??
      (type === "error" ? ERROR_TOAST_DURATION_MS : SUCCESS_TOAST_DURATION_MS),
    icon: type === "error" ? <ErrorIcon /> : <CheckmarkIcon />,
    style: {
      fontWeight: 500,
    },
  });
}

export function createSuccessToast(title: string) {
  createToast("success", title);
}

export function createErrorToast(title: string, duration?: number) {
  createToast("error", title, duration);
}

const toastTitleClassName = "flex items-center";

export function createPromiseToast(
  promise: Promise<any>,
  loadingLabel: string,
  successLabel: string,
  errorLabel: string
) {
  toast.promise(
    promise,
    {
      loading: (
        <div className={toastTitleClassName}>
          <LoaderIcon className="m-0 p-0" />
          <div className="ml-[8px]">
            <b>{loadingLabel}</b>
          </div>
        </div>
      ),
      success: (
        <div className={toastTitleClassName}>
          <CheckmarkIcon className="m-0 p-0" />
          <div className="ml-[8px]">
            <b>{successLabel}</b>
          </div>
        </div>
      ),
      error: (error: AxiosError) => (
        <div className="flex flex-col gap-[6px]">
          <div className={toastTitleClassName}>
            <div className="text-red-700">
              <b>{errorLabel}</b>
            </div>
          </div>
          <div
            className="max-w-[300px]"
            style={{ animation: "error-toast-enter 0.3s ease-out forwards" }}
          >
            <div>{parseAxiosErrorMessage(error)}</div>
          </div>
        </div>
      ),
    },
    {
      success: {
        duration: SUCCESS_TOAST_DURATION_MS,
      },
      error: {
        duration: ERROR_TOAST_DURATION_MS,
        // @ts-ignore (field from type ToastExtended)
        placeCloseInAbsolute: true,
      },
    }
  );
}
