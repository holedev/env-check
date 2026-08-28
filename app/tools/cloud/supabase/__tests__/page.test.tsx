import { render, screen } from "@testing-library/react";
import type { ToolHeaderProps } from "@/components/custom/Tools/ToolHeader";
import Page from "../page";

jest.mock("@/components/custom/Tools/ToolHeader", () => ({
  ToolHeader: ({ toolPath }: ToolHeaderProps) => <div data-testid='tool-header'>{toolPath}</div>
}));

jest.mock("../form.client", () => ({
  FormClient: () => <div data-testid='form-client'>Form Client Supabase</div>
}));

test("Page renders ToolHeader and FormClient", () => {
  render(<Page />);
  expect(screen.getByTestId("tool-header")).toBeInTheDocument();
  expect(screen.getByTestId("form-client")).toHaveTextContent("Form Client Supabase");
});
