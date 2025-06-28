import type { ResponseType } from "@/types/response";
import { ErrorResponse, SuccessResponse } from "./response";

type handleErrorServerType = {
  cb: () => Promise<object>;
};

const handleErrorServerNoAuth = async ({ cb }: handleErrorServerType): Promise<ResponseType> => {
  try {
    const res = await cb();
    return SuccessResponse({ payload: res });
  } catch (error) {
    console.error("[handleErrorServer.ts:13] ", error);
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

export { handleErrorServerNoAuth };
