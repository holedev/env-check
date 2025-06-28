import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

const _TOOL_PATH: ToolPath = "google-gemini";
const _LIB_INFO = {
  packageName: "openai",
  url: "https://www.npmjs.com/package/openai"
};

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} libInfo={_LIB_INFO} />
      <FormClient />
    </div>
  );
}
