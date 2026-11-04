"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkAnthropicKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").startsWith("sk-ant-", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkAnthropicKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='anthropic'
  />
);

export { FormClient };
