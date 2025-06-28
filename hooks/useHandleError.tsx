import type { ErrorResponseType, ResponseType, SuccessResponseType } from "@/types/response";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type handleErrorType = {
  cb: () => Promise<ResponseType>;
  postOnSuccess?: ({ data }: { data: SuccessResponseType }) => void;
  postOnError?: ({ error }: { error: ErrorResponseType }) => void;
  withSuccessNotify?: boolean;
};

const useHandleError = () => {
  const t = useTranslations("common.notify");

  const handleErrorClient = async ({
    cb,
    postOnSuccess = () => {},
    postOnError = () => {},
    withSuccessNotify = true
  }: handleErrorType) => {
    try {
      const { error, data } = await cb();

      if (error) {
        toast.error(t("error.title"), {
          description: error.message
        });
        postOnError({ error });
        return;
      }

      if (withSuccessNotify) {
        toast.success(t("success.title"), {
          description: t("success.message")
        });
      }

      postOnSuccess({ data: data ?? {} });
    } catch (error) {
      console.error("[useHandleError.tsx:34] ", error);
      if (error instanceof Error) {
        toast.error(t("error.unknownError"), {
          description: error.message
        });
        return;
      }
    }
  };

  return { handleErrorClient, toast };
};

export { useHandleError };
