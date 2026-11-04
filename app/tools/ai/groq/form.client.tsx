"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkGroqKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").startsWith("gsk_", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkGroqKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='groq'
  />
);

export { FormClient };
