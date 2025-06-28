import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

const _TOOL_PATH: ToolPath = "gmail-smtp";
const _LIB_INFO = {
  packageName: "nodemailer",
  url: "https://www.npmjs.com/package/nodemailer"
};

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} libInfo={_LIB_INFO} />
      <FormClient />
    </div>
  );
}
