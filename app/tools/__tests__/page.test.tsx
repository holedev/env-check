import { render, screen, within } from "@testing-library/react";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import Page from "../page";

const TOOL_NAME_KEY = /tools\.items\./;

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

test("lists every registered tool, linked under its group", () => {
  render(<Page />);

  for (const group of _TOOL_GROUP_LIST) {
    for (const toolPath of group.tools) {
      const link = screen.getByRole("link", { name: new RegExp(`tools\\.items\\.${toolPath}\\.name`) });
      expect(link).toHaveAttribute("href", `/tools/${group.path}/${toolPath}`);
    }
  }
  expect(screen.getAllByRole("link", { name: TOOL_NAME_KEY })).toHaveLength(_TOOL_LIST.length);
});

test("skips groups without tools", () => {
  render(<Page />);

  for (const group of _TOOL_GROUP_LIST) {
    const heading = screen.queryByRole("heading", { name: `tools.groups.${group.path}.name` });
    if (group.tools.length === 0) {
      expect(heading).not.toBeInTheDocument();
    } else {
      const section = heading?.closest("section") as HTMLElement;
      expect(within(section).getByRole("link", { name: "workspace.overview.viewGroup" })).toHaveAttribute(
        "href",
        `/tools/${group.path}`
      );
    }
  }
});
