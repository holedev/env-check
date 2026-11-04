"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkOpenRouterKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").startsWith("sk-or-", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkOpenRouterKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='openrouter'
  />
);

export { FormClient };
