import type { ToolHeaderProps } from "@/components/custom/Tools/ToolHeader";
import { render, screen } from "@testing-library/react";
import Page from "./page";

jest.mock("@/components/custom/Tools/ToolHeader", () => ({
  ToolHeader: ({ toolPath, libInfo }: ToolHeaderProps) => (
    <div data-testid='tool-header'>
      {toolPath} - {libInfo.packageName}
    </div>
  )
}));

jest.mock("./form.client", () => ({
  FormClient: () => <div data-testid='form-client'>Form Client s3 compatiable</div>
}));

test("Page renders ToolHeader và FormClient", () => {
  render(<Page />);
  expect(screen.getByTestId("tool-header")).toBeInTheDocument();
  expect(screen.getByTestId("form-client")).toHaveTextContent("Form Client s3 compatiable");
});
