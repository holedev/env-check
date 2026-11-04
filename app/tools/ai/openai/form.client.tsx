"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkOpenAiKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").startsWith("sk-", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkOpenAiKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='openai'
  />
);

export { FormClient };
