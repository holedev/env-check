import { GithubForm } from "@/app/tools/cloud/github/form.client";
import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";

/**
 * I have find any way to check OAuth App and GitHub App tokens, but seem it cannot be done
 * without user interaction. So, I have removed the OAuth App and GitHub App options from
 * the form. Now, only Personal Access Token is supported.
 */

const _TOOL_PATH: ToolPath = "github";
const _LIB_INFO = {
  packageName: "@octokit/rest",
  url: "https://www.npmjs.com/package/@octokit/rest"
};

export default function GithubPage() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} libInfo={_LIB_INFO} />
      <GithubForm />
    </div>
  );
}
