import type { ToolHeaderProps } from "@/components/custom/Tools/ToolHeader";
import { render, screen } from "@testing-library/react";
import Page from "../page";

jest.mock("@/components/custom/Tools/ToolHeader", () => ({
  ToolHeader: ({ toolPath, libInfo }: ToolHeaderProps) => (
    <div data-testid='tool-header'>
      {toolPath} - {libInfo.packageName}
    </div>
  )
}));

jest.mock("../form.client", () => ({
  GithubForm: () => <div data-testid='form-client'>Github Form</div>
}));

test("Page renders ToolHeader and GithubForm", () => {
  render(<Page />);
  expect(screen.getByTestId("tool-header")).toBeInTheDocument();
  expect(screen.getByTestId("form-client")).toHaveTextContent("Github Form");
});
