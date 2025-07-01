import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

const _TOOL_PATH: ToolPath = "mongodb";

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} />
      <FormClient />
    </div>
  );
}
