import { ToolList } from "@/components/custom/Tools/ToolList";
import type { ToolGroupCategory } from "@/types/tool";

const _GROUP_PATH: ToolGroupCategory = "payment";

export default function Page() {
  return <ToolList groupPath={_GROUP_PATH} />;
}
