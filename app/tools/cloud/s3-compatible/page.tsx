import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

const _TOOL_PATH: ToolPath = "s3-compatible";
const _LIB_INFO = {
  packageName: "@aws-sdk/client-s3",
  url: "https://www.npmjs.com/package/@aws-sdk/client-s3"
};

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} libInfo={_LIB_INFO} />
      <FormClient />
    </div>
  );
}
