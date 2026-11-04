import { render, screen, within } from "@testing-library/react";
import { _REPO_URL } from "@/constants/site";
import { _TOOL_LIST } from "@/constants/tool";
import Page, { generateMetadata } from "../page";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) => `${namespace}.${key}`,
  getLocale: async () => "vi"
}));

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

const SEARCH_HINT = /landing\.hero\.searchHint/;

test("hero links into the Workspace and to the repository", () => {
  render(<Page />);

  expect(screen.getByRole("heading", { level: 1, name: "landing.hero.title" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "landing.hero.primary" })).toHaveAttribute("href", "/tools");
  expect(screen.getByRole("link", { name: "landing.hero.secondary" })).toHaveAttribute("href", _REPO_URL);
  expect(screen.getByRole("button", { name: SEARCH_HINT })).toBeInTheDocument();
});

test("the probe.log terminal shows all three outcomes", () => {
  render(<Page />);

  const terminal = screen.getByRole("figure", { name: "landing.terminal.title" });
  for (const key of ["valid", "restricted", "blocked"]) {
    expect(within(terminal).getByText(`landing.terminal.${key}`)).toBeInTheDocument();
  }
});

test("lists every service and the three security pillars", () => {
  render(<Page />);

  const services = screen.getByRole("heading", { name: "landing.services.title" }).closest("section") as HTMLElement;
  expect(within(services).getAllByRole("listitem")).toHaveLength(_TOOL_LIST.length);
  for (const key of ["probe", "redact", "guard"]) {
    expect(screen.getByRole("heading", { name: `landing.security.${key}.title` })).toBeInTheDocument();
  }
});

test("metadata is localised and canonical", async () => {
  const metadata = await generateMetadata();

  expect(metadata.title).toEqual({ absolute: "landing.meta.title" });
  expect(metadata.description).toBe("landing.meta.description");
  expect(metadata.alternates?.canonical).toBe("/");
  expect(metadata.openGraph).toMatchObject({ locale: "vi_VN", url: "/" });
});
