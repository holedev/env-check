import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

const _TOOL_PATH: ToolPath = "mongodb";
const _LIB_INFO = {
  packageName: "mongodb",
  url: "https://www.npmjs.com/package/mongodb"
};

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} libInfo={_LIB_INFO} />
      <FormClient />
    </div>
  );
}
