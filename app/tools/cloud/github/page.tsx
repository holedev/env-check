import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

/**
 * OAuth App and GitHub App tokens can't be validated without user interaction,
 * so this tool supports Personal Access Tokens only.
 */

const _TOOL_PATH: ToolPath = "github";

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} />
      <FormClient />
    </div>
  );
}
