import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import type { ResponseType } from "@/types/response";

jest.mock("next-intl", () => {
  const t = (key: string, values?: Record<string, unknown>) => (values ? `${key}(${JSON.stringify(values)})` : key);
  t.has = (key: string) => key.endsWith(".summary") || key.endsWith(".never");
  t.raw = (key: string) => (key.endsWith(".summary") ? { login: "Login label" } : ["Repositories"]);
  return { useTranslations: () => t };
});

jest.mock("sonner", () => ({ toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() } }));

const schema = z.object({
  apiKey: z
    .string()
    .min(1, "required")
    .refine((v) => !v.startsWith("pk_"), "errors.publishable"),
  region: z.string()
});

const renderForm = (action: (values: z.infer<typeof schema>) => Promise<ResponseType>) =>
  render(
    <ValidationForm
      action={action}
      defaultValues={{ apiKey: "", region: "us" }}
      fields={[{ name: "apiKey" }, { name: "region", kind: "select", options: ["us", "eu"] }]}
      schema={schema}
      toolPath='github'
    />
  );

const fillAndSubmit = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText("tools.items.github.form.apiKey.placeholder"), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "tools.items.github.form.submit" }));
};

test("shows how the tool is checked before the first submit", () => {
  renderForm(jest.fn());

  expect(screen.getByRole("heading", { name: "workspace.howItWorks.title" })).toBeInTheDocument();
  expect(screen.getByText("api.github.com/user")).toBeInTheDocument();
  expect(screen.getByText("Login label")).toBeInTheDocument();
  expect(screen.getByText("Repositories")).toBeInTheDocument();
});

test("renders a valid outcome with its summary", async () => {
  const action = jest.fn().mockResolvedValue({
    error: null,
    data: {
      payload: {
        outcome: "valid",
        summary: [
          { key: "mode", value: "test" },
          { key: "live", value: false }
        ]
      }
    }
  });
  renderForm(action);

  fillAndSubmit("sk_test_123");

  expect(await screen.findByText("tools.items.github.validCredentials")).toBeInTheDocument();
  expect(screen.getByText("tools.items.github.summary.mode")).toBeInTheDocument();
  expect(screen.getByText("test")).toBeInTheDocument();
  expect(screen.getByText("common.validation.no")).toBeInTheDocument();
  expect(action).toHaveBeenCalledWith({ apiKey: "sk_test_123", region: "us" });
});

test("renders a restricted outcome with the service's reason", async () => {
  renderForm(
    jest.fn().mockResolvedValue({
      error: null,
      data: { payload: { outcome: "restricted", reason: "Key lacks balance read", summary: [] } }
    })
  );

  fillAndSubmit("rk_live_123");

  expect(await screen.findByText("tools.items.github.restrictedCredentials")).toBeInTheDocument();
  expect(screen.getByText("Key lacks balance read")).toBeInTheDocument();
});

test("renders an invalid outcome with the error message", async () => {
  renderForm(jest.fn().mockResolvedValue({ error: { message: "Invalid API Key provided" }, data: null }));

  fillAndSubmit("sk_test_bad");

  expect(await screen.findByText("tools.items.github.invalidCredentials")).toBeInTheDocument();
  expect(screen.getByText("Invalid API Key provided")).toBeInTheDocument();
});

test("translates schema errors and does not call the action", async () => {
  const action = jest.fn();
  renderForm(action);

  fillAndSubmit("pk_test_123");

  expect(await screen.findByText("tools.items.github.form.apiKey.errors.publishable")).toBeInTheDocument();
  fillAndSubmit("");
  await waitFor(() => expect(screen.getByText("common.validation.required")).toBeInTheDocument());
  expect(action).not.toHaveBeenCalled();
});
