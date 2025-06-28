import { ToolList } from "@/components/custom/Tools/ToolList";
import type { ToolGroupCategory } from "@/types/tool";

export default function Page() {
  const _GROUP_PATH: ToolGroupCategory = "ai" as const;

  return <ToolList groupPath={_GROUP_PATH} />;
}
