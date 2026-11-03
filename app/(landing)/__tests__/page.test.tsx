import { render, screen } from "@testing-library/react";
import { _REPO_URL } from "@/constants/site";
import { _TOOL_GROUP_LIST } from "@/constants/tool";
import Page, { generateMetadata } from "../page";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) => `${namespace}.${key}`,
  getLocale: async () => "vi"
}));

test("hero links into the Workspace and to the repository", () => {
  render(<Page />);

  expect(screen.getByRole("heading", { level: 1, name: "landing.hero.title" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "landing.hero.primary" })).toHaveAttribute("href", "/tools");
  expect(screen.getByRole("link", { name: "landing.cta.button" })).toHaveAttribute("href", "/tools");
  expect(screen.getByRole("link", { name: "landing.hero.secondary" })).toHaveAttribute("href", _REPO_URL);
});

test("explains the security model", () => {
  render(<Page />);

  for (const key of ["serverAction", "noStorage", "openSource"]) {
    expect(screen.getByText(`landing.security.${key}.title`)).toBeInTheDocument();
  }
});

test("links every non-empty tool group", () => {
  render(<Page />);

  for (const group of _TOOL_GROUP_LIST) {
    const link = screen.queryByRole("link", { name: new RegExp(`tools\\.groups\\.${group.path}\\.name`) });
    if (group.tools.length === 0) {
      expect(link).not.toBeInTheDocument();
    } else {
      expect(link).toHaveAttribute("href", `/tools/${group.path}`);
    }
  }
});

test("metadata is localised and canonical", async () => {
  const metadata = await generateMetadata();

  expect(metadata.title).toEqual({ absolute: "landing.meta.title" });
  expect(metadata.description).toBe("landing.meta.description");
  expect(metadata.alternates?.canonical).toBe("/");
  expect(metadata.openGraph).toMatchObject({ locale: "vi_VN", url: "/" });
});
